import uuid

import structlog
from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.compete.models import MatchParticipant
from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.teams.exceptions import TeamMaxSizeExceeded
from siarnaq.api.teams.filters import TeamActiveSubmissionFilter, TeamOrderingFilter
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

    filter_backends = [
        filters.SearchFilter,
        TeamOrderingFilter,
        TeamActiveSubmissionFilter,
    ]
    ordering = "pk"
    ordering_fields = ["pk", "name"] + TeamOrderingFilter.ordering_fields
    search_fields = ["name", "=members__username"]

    def get_queryset(self):
        queryset = (
            Team.objects.filter(episode=self.kwargs["episode_id"])
            .select_related("profile__rating")
            .prefetch_related("members")
        )
        if not self.request.user.is_staff:
            queryset = queryset.visible()
        return queryset

    def get_serializer_class(self):
        match self.action:
            case "create":
                return TeamCreateSerializer
            case "retrieve" | "list":
                return TeamPublicSerializer
            case _:
                return super().get_serializer_class()

    def get_permissions(self):
        match self.action:
            case "create":
                return (
                    IsAuthenticated(),
                    IsEpisodeAvailable(),
                    (~IsOnTeam)(),
                )
            case "retrieve" | "list":
                return (IsEpisodeAvailable(),)
            case _:
                return super().get_permissions()

    @action(
        detail=False,
        methods=["get", "put", "patch"],
        permission_classes=(IsAuthenticated, IsEpisodeAvailable),
        serializer_class=TeamPrivateSerializer,
    )
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
    @action(
        detail=False,
        methods=["post"],
        serializer_class=None,
        permission_classes=(IsAuthenticated, IsEpisodeAvailable),
    )
    def leave(self, request, *, episode_id):
        """Leave a team."""
        with transaction.atomic():
            team = get_object_or_404(self.get_queryset(), members=request.user)
            team.members.remove(request.user)
        logger.debug("team_leave", message="User has left team.", team=team.pk)
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @extend_schema(responses={status.HTTP_204_NO_CONTENT: None})
    @action(
        detail=False,
        methods=["post"],
        serializer_class=TeamJoinSerializer,
        permission_classes=(IsAuthenticated, IsEpisodeAvailable, ~IsOnTeam),
    )
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

        try:
            with transaction.atomic():
                team = get_object_or_404(
                    queryset,
                    name=serializer.validated_data["name"],
                    episode=self.kwargs["episode_id"],
                )
                team.members.add(request.user)
        except TeamMaxSizeExceeded:
            return Response(None, status=status.HTTP_409_CONFLICT)
        logger.debug("team_join", message="User has joined team.", team=team.pk)
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @extend_schema(responses={status.HTTP_204_NO_CONTENT: None})
    @action(
        detail=False,
        methods=["post"],
        serializer_class=TeamAvatarSerializer,
        permission_classes=(IsAuthenticated, IsEpisodeAvailable),
    )
    def avatar(self, request, pk=None, *, episode_id):
        """Update uploaded avatar."""
        team = get_object_or_404(self.get_queryset(), members=request.user)
        profile = team.profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        avatar = serializer.validated_data["avatar"]

        with transaction.atomic():
            profile.has_avatar = True
            profile.avatar_uuid = uuid.uuid4()
            profile.save(update_fields=["has_avatar", "avatar_uuid"])
            titan.upload_image(avatar, profile.get_avatar_path())

        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["post"],
        serializer_class=None,
        permission_classes=(IsAuthenticated, IsEpisodeAvailable),
    )
    def record(self, request, pk=None, *, episode_id):
        """Retrieve the win/loss record of a team"""
        match_participations = MatchParticipant.objects.filter(
            team_id=request.data["id"]
        )
        win_count = 0
        loss_count = 0
        for mp in match_participations:
            match = mp.match
            team_score = [
                p.score
                for p in match.participants.all()
                if p.team.id == request.data["id"]
            ]
            opponent_score = [
                p.score
                for p in match.participants.all()
                if p.team.id != request.data["id"]
            ]
            if team_score and opponent_score:
                if team_score[0] > opponent_score[0]:
                    win_count += 1
                else:
                    loss_count += 1
        return Response({"wins": win_count, "losses": loss_count})
