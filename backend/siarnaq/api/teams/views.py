import uuid

import google.cloud.storage as storage
import structlog
from django.conf import settings
from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.episodes.models import EligibilityCriterion
from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.teams.exceptions import TeamMaxSizeExceeded
from siarnaq.api.teams.filters import (
    TeamActiveSubmissionFilter,
    TeamEligibilityFilter,
    TeamOrderingFilter,
)
from siarnaq.api.teams.models import ClassRequirement, Team, TeamStatus
from siarnaq.api.teams.permissions import IsOnTeam
from siarnaq.api.teams.serializers import (
    ClassRequirementSerializer,
    TeamAvatarSerializer,
    TeamCreateSerializer,
    TeamJoinSerializer,
    TeamLeaveSerializer,
    TeamPrivateSerializer,
    TeamPublicSerializer,
    TeamReportSerializer,
    UserPassedSerializer,
)
from siarnaq.api.user.models import User
from siarnaq.gcloud import titan

logger = structlog.get_logger(__name__)


class ForbiddenEligiblity(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You are not permitted to select these eligibility criteria."
    default_code = "forbidden_eligibility"


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="has_active_submission",
            type=bool,
            description="Filter teams by active submission status",
        ),
        OpenApiParameter(
            name="eligible_for",
            type=int,
            many=True,
            description="Filter teams by a set of eligibility criteria ID",
        ),
    ]
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

    filter_backends = [
        filters.SearchFilter,
        TeamOrderingFilter,
        TeamActiveSubmissionFilter,
        TeamEligibilityFilter,
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
                if request.data["profile"] is not None:
                    # If user is editing their profile, verify that they've
                    # selected valid eligibility criteria.
                    if eligible_for := request.data["profile"]["eligible_for"]:
                        selected_criteria = EligibilityCriterion.objects.filter(
                            pk__in=eligible_for
                        )
                        episode_criteria = team.episode.eligibility_criteria.filter(
                            pk__in=eligible_for
                        )
                        if any(
                            criterion.is_private or criterion not in episode_criteria
                            for criterion in selected_criteria
                        ):
                            raise ForbiddenEligiblity

                serializer = self.get_serializer(team, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)

    @extend_schema(request=None)
    @action(
        detail=False,
        methods=["post"],
        serializer_class=TeamLeaveSerializer,
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

    @extend_schema(
        responses={status.HTTP_204_NO_CONTENT: None},
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "avatar": {"type": "string", "format": "binary"},
                },
            }
        },
    )
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


class ClassRequirementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving and checking class requirements.
    """

    serializer_class = ClassRequirementSerializer
    permission_classes = (IsEpisodeAvailable,)

    def get_queryset(self):
        return ClassRequirement.objects.filter(episode=self.kwargs["episode_id"])

    @action(
        detail=True,
        methods=["get"],
        permission_classes=(IsAuthenticated,),
        serializer_class=UserPassedSerializer,
    )
    def check(self, request, pk=None, episode_id=None):
        requirement = self.get_object()
        user = User.objects.with_passed(requirement).get(pk=request.user.pk)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["get"],
        permission_classes=(IsAdminUser,),
        serializer_class=UserPassedSerializer,
    )
    def compute(self, request, pk=None, episode_id=None):
        requirement = self.get_object()
        users = User.objects.with_passed(requirement).filter(teams__episode=episode_id)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @extend_schema(responses={status.HTTP_204_NO_CONTENT: None})
    @action(
        detail=False,
        methods=["get", "put"],
        serializer_class=TeamReportSerializer,
        permission_classes=(IsAuthenticated, IsEpisodeAvailable),
    )
    def report(self, request, pk=None, *, episode_id):
        """Retrieve or update team strategy report"""
        team = Team.objects.filter(episode=episode_id, members=request.user).get()
        profile = team.profile
        match request.method.lower():
            case "get":
                if not profile.has_report:
                    raise Http404
                data = titan.get_object(
                    bucket=settings.GCLOUD_BUCKET_SECURE,
                    name=profile.get_report_path(),
                    check_safety=True,
                )
                serializer = self.get_serializer(data)
                return Response(serializer.data)

            case "put":
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                report = serializer.validated_data["report"]
                profile
                client = storage.Client(credentials=settings.GCLOUD_CREDENTIALS)
                blob = client.bucket(settings.GCLOUD_BUCKET_SECURE).blob(
                    profile.get_report_path()
                )
                with blob.open("wb", content_type="application/pdf") as f:
                    for chunk in report.chunks():
                        f.write(chunk)
                titan.request_scan(blob)

                with transaction.atomic():
                    profile.has_report = True
                    profile.save(update_fields=["has_report"])

                return Response(None, status=status.HTTP_204_NO_CONTENT)
