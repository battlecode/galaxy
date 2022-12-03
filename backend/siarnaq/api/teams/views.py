import posixpath
import uuid

import structlog
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
    TeamAvatarSerializer,
    TeamCreateSerializer,
    TeamJoinSerializer,
    TeamPrivateSerializer,
    TeamPublicSerializer,
)
from siarnaq.gcloud import titan

logger = structlog.get_logger(__name__)


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
            case "create":
                return TeamCreateSerializer
            case "me":
                return TeamPrivateSerializer
            case "retrieve" | "list":
                return TeamPublicSerializer
            case "join":
                return TeamJoinSerializer
            case "leave":
                return None
            case "avatar":
                return TeamAvatarSerializer
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
            case "me" | "leave" | "avatar":
                return (IsAuthenticated(), IsEpisodeAvailable(allow_frozen=True))

    @action(detail=False, methods=["get", "put", "patch"])
    def me(self, request, *, episode_id):
        """Retrieve or update information about the current team."""
        team = get_object_or_404(self.get_queryset(), members=request.user)
        match request.method.lower():
            case "get":
                serializer = self.get_serializer(team)
                return Response(serializer.data)
            case "put":
                serializer = self.get_serializer(team, data=request.data)
                serializer.is_valid(raise_exception=True)
                serializer.save()
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
        logger.debug("team_leave", message="User has left team.", team=team.pk)
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
        logger.debug("team_join", message="User has joined team.", team=team.pk)
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @extend_schema(responses={status.HTTP_204_NO_CONTENT: None})
    @action(detail=False, methods=["post"])
    def avatar(self, request, pk=None, *, episode_id):
        """Update uploaded avatar."""
        team = get_object_or_404(self.get_queryset(), members=request.user)
        profile = team.profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        avatar = serializer.validated_data["avatar"]
        path = posixpath.join("team", str(self.pk), "avatar.png")

        with transaction.atomic():
            profile.has_avatar = True
            profile.avatar_uuid = uuid.uuid4()
            profile.save(update_fields=["has_avatar", "avatar_uuid"])
            titan.upload_image(avatar, path)

        return Response(None, status=status.HTTP_204_NO_CONTENT)
