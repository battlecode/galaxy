from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.teams.filters import TeamOrderingFilter
from siarnaq.api.teams.models import Team, TeamStatus
from siarnaq.api.teams.permissions import IsOnTeam
from siarnaq.api.teams.serializers import (
    TeamJoinSerializer,
    TeamPrivateSerializer,
    TeamPublicSerializer,
)


class TeamViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
):
    """
    A viewset for retrieving and updating all team/team profile info.

    When creating a team, add the logged in user as the sole member.
    """

    filter_backends = [filters.SearchFilter, TeamOrderingFilter]
    ordering = "pk"
    ordering_fields = ["pk", "name"] + TeamOrderingFilter.ordering_fields
    search_fields = ["name", "=members__username"]

    def get_queryset(self):
        return (
            Team.objects.filter(episode=self.kwargs["episode_id"])
            .select_related("profile__rating")
            .prefetch_related("members")
        )

    def get_serializer_class(self):
        match self.action:
            case "create" | "me":
                return TeamPrivateSerializer
            case "retrieve" | "list":
                return TeamPublicSerializer
            case "join":
                return TeamJoinSerializer
            case "leave":
                return None
            case _:
                raise RuntimeError("Unexpected action")

    def get_permissions(self):
        match self.action:
            case "create" | "join":
                return (
                    IsAuthenticated(),
                    IsEpisodeAvailable(allow_frozen=True),
                    (~IsOnTeam)(),
                )
            case "retrieve" | "list":
                return (IsEpisodeAvailable(allow_frozen=True),)
            case "me" | "leave":
                return (IsAuthenticated(), IsEpisodeAvailable(allow_frozen=True))

    @action(detail=False, methods=["get", "patch"])
    def me(self, request, *, episode_id):
        """Retrieve or update information about the current team."""
        team = get_object_or_404(self.get_queryset(), members=request.user)
        match request.method.lower():
            case "get":
                serializer = self.get_serializer(team)
                return Response(serializer.data)
            case "patch":
                serializer = self.get_serializer(team, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)

    @extend_schema(request=None)
    @action(detail=False, methods=["post"])
    def leave(self, request, *, episode_id):
        """Leave a team."""
        with transaction.atomic():
            team = get_object_or_404(self.get_queryset(), members=request.user)
            team.members.remove(request.user)
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @extend_schema(responses={status.HTTP_204_NO_CONTENT: None})
    @action(detail=False, methods=["post"])
    def join(self, request, pk=None, *, episode_id):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = self.get_queryset()
        if not request.user.is_staff:
            # Regular users may only join active regular teams and must have the correct
            # join key. Staff users do not have these restrictions.
            queryset = queryset.filter(
                status=TeamStatus.REGULAR,
                join_key=serializer.validated_data["join_key"],
            )

        with transaction.atomic():
            team = get_object_or_404(
                queryset,
                name=serializer.validated_data["name"],
                episode=self.kwargs["episode_id"],
            )
            team.members.add(request.user)
        return Response(None, status=status.HTTP_204_NO_CONTENT)
