from typing import Optional

import google.cloud.storage as storage
import structlog
from django.conf import settings
from django.db import NotSupportedError, transaction
from django.db.models import Exists, OuterRef, Q, Subquery
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.compete.filters import IsSubmissionCreatorFilterBackend
from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    SaturnStatus,
    ScrimmageRequest,
    ScrimmageRequestStatus,
    Submission,
)
from siarnaq.api.compete.permissions import HasTeamSubmission
from siarnaq.api.compete.serializers import (
    HistoricalRatingSerializer,
    MatchReportSerializer,
    MatchSerializer,
    ScrimmageRequestSerializer,
    SubmissionDownloadSerializer,
    SubmissionReportSerializer,
    SubmissionSerializer,
    TournamentSubmissionSerializer,
)
from siarnaq.api.episodes.models import ReleaseStatus, Tournament
from siarnaq.api.episodes.permissions import IsEpisodeAvailable, IsEpisodeMutable
from siarnaq.api.teams.models import Team, TeamStatus
from siarnaq.api.teams.permissions import IsOnTeam
from siarnaq.gcloud import titan

logger = structlog.get_logger(__name__)


def parse_int(v: str) -> Optional[int]:
    try:
        return int(v)
    except (ValueError, TypeError):
        return None


class TooManyScrimmages(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "You have too many running scrimmages or requests with this team."
    default_code = "too_many_scrimmages"


class EpisodeTeamUserContextMixin:
    """Add the current episode, team and user to the serializer context."""

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            episode_id=self.kwargs["episode_id"],
            user_id=self.request.user.pk,
            team_id=None,
            user_is_staff=self.request.user.is_staff,
        )
        if self.request.user.is_authenticated:
            try:
                team = Team.objects.get(
                    episode=self.kwargs["episode_id"],
                    members=self.request.user,
                )
            except Team.DoesNotExist:
                pass  # User is not on a team
            else:
                context.update(
                    team_id=team.pk,
                    team_is_staff=team.is_staff(),
                )
        return context


class SubmissionViewSet(
    EpisodeTeamUserContextMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    A viewset for creating and retrieving Submissions.
    """

    serializer_class = SubmissionSerializer
    permission_classes = (
        IsAuthenticated,
        IsEpisodeMutable | IsAdminUser,
        IsOnTeam,
    )
    filter_backends = [IsSubmissionCreatorFilterBackend]

    def get_queryset(self):
        return (
            Submission.objects.filter(episode=self.kwargs["episode_id"])
            .select_related("team", "user")
            .order_by("-pk")
        )

    def create(self, request, *, episode_id):
        """
        Create a new submission. This operation creates a submission record in the
        database, saves the source code to the storage bucket on Google cloud, and
        enqueues the submission for compilation on Saturn.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        source_code = serializer.validated_data["source_code"]

        with transaction.atomic():
            instance = serializer.save()
            log = logger.bind(submission=instance.pk)

            if not settings.GCLOUD_ENABLE_ACTIONS:
                log.warn(
                    "submission_disabled",
                    message="Submission file uploads are disabled.",
                )
            else:
                # Upload file to storage
                log.info("submission_upload", message="Uploading submission file.")
                client = storage.Client(credentials=settings.GCLOUD_CREDENTIALS)
                blob = client.bucket(settings.GCLOUD_BUCKET_SECURE).blob(
                    instance.get_source_path()
                )
                with blob.open("wb") as f:
                    for chunk in source_code.chunks():
                        f.write(chunk)

        # Send to Saturn
        Submission.objects.filter(pk=instance.pk).enqueue()

        # Generate the Location header, as supplied by CreateModelMixin
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @action(
        detail=False, methods=["get"], serializer_class=TournamentSubmissionSerializer
    )
    def tournament(self, request, *, episode_id):
        """Retrieve the submissions used in tournaments by the current team.."""
        tournaments = Tournament.objects.filter(
            episode_id=episode_id, submission_unfreeze__lte=timezone.now()
        ).visible_to_user(is_staff=request.user.is_staff)
        queryset = self.filter_queryset(self.get_queryset()).for_tournaments(
            tournaments
        )
        serializer = self.get_serializer(queryset, many=True)
        try:
            return Response(serializer.data)
        except NotSupportedError:
            return Response(
                "Not supported on this database.",
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

    @action(detail=True, methods=["get"], serializer_class=SubmissionDownloadSerializer)
    def download(self, request, pk=None, *, episode_id):
        """Download the source code associated with a submission."""
        submission = self.get_object()
        data = titan.get_object(
            bucket=settings.GCLOUD_BUCKET_SECURE,
            name=submission.get_source_path(),
            check_safety=False,
        )
        serializer = self.get_serializer(data)
        return Response(serializer.data)

    @extend_schema(
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Report has been received"
            ),
            status.HTTP_409_CONFLICT: OpenApiResponse(
                description="This submission was already finalized"
            ),
        }
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=SubmissionReportSerializer,
        throttle_classes=(),
        filter_backends=[],
    )
    def report(self, request, pk=None, *, episode_id):
        """
        Report the outcome of this submission on Saturn.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class MatchViewSet(
    EpisodeTeamUserContextMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """
    A viewset for viewing and retrieving Matches.
    """

    serializer_class = MatchSerializer
    permission_classes = (IsEpisodeMutable | IsAdminUser,)

    def get_queryset(self):
        queryset = (
            Match.objects.filter(episode=self.kwargs["episode_id"])
            .select_related("tournament_round__tournament")
            .prefetch_related(
                "participants__previous_participation__rating",
                "participants__rating",
                "participants__team__profile__rating",
                "participants__team__members",
                "maps",
            )
            .order_by("-pk")
        )
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action != "tournament":
            return context
        # check if the external id is valid
        external_id_private = self.request.query_params.get("external_id_private")
        tournaments = None
        if external_id_private is None:
            return context
        tournaments = Tournament.objects.visible_to_user(is_staff=True)
        tournaments = tournaments.filter(external_id_private=external_id_private)
        if tournaments.count() == 1:
            # if the external id is valid, allow lookup of all tournament info
            context.update({"user_is_staff": True})
        return context

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="tournament_id",
                type=str,
                description="A tournament to filter for.",
            ),
            OpenApiParameter(
                name="external_id_private",
                type=str,
                description="A private id to filter for.",
            ),
            OpenApiParameter(
                name="round_id",
                type=int,
                description="A tournament round to filter for.",
            ),
            OpenApiParameter(
                name="team_id", type=int, description="A team to filter for."
            ),
        ],
        responses={status.HTTP_200_OK: MatchSerializer(many=True)},
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsEpisodeMutable,),
    )
    def tournament(self, request, *, episode_id):
        """List matches played in a tournament."""
        queryset = self.get_queryset()

        external_id_private = self.request.query_params.get("external_id_private")
        tournaments = None
        if external_id_private is not None:
            # If an external id is provided, filter tournaments by it
            tournaments = Tournament.objects.visible_to_user(is_staff=True)
            tournaments = tournaments.filter(external_id_private=external_id_private)
        else:
            # Otherwise filter by provided tournament id
            tournaments = Tournament.objects.visible_to_user(
                is_staff=request.user.is_staff
            )
            tournament_id = self.request.query_params.get("tournament_id")
            if tournament_id is not None:
                tournaments = tournaments.filter(pk=tournament_id)
        if tournaments.count() != 1:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        queryset = self.get_queryset().filter(
            tournament_round__tournament__in=Subquery(tournaments.values("pk"))
        )
        # Filter rounds as requested
        round_id = parse_int(self.request.query_params.get("round_id"))
        if round_id is not None:
            queryset = queryset.filter(tournament_round=round_id)

        # Filter teams as requested
        team_id = parse_int(self.request.query_params.get("team_id"))
        if team_id is not None:
            queryset = queryset.filter(participants__team=team_id)
            if not request.user.is_staff:
                # Regular users do not know about unreleased tournament matches
                queryset = queryset.exclude(
                    tournament_round__release_status__lt=ReleaseStatus.PARTICIPANTS
                )

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="team_id",
                type=int,
                description="A team to filter for. Defaults to your own team.",
            ),
        ],
        responses={status.HTTP_200_OK: MatchSerializer(many=True)},
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsEpisodeMutable,),
    )
    def scrimmage(self, request, pk=None, *, episode_id):
        """List all scrimmages that a particular team participated in."""
        queryset = self.get_queryset().filter(tournament_round__isnull=True)

        team_id = parse_int(self.request.query_params.get("team_id"))
        if team_id is not None:
            queryset = queryset.filter(participants__team=team_id)
        else:
            queryset = queryset.filter(participants__team__members=request.user.pk)

        if not request.user.is_staff:
            # Hide all matches with invisible teams.
            has_invisible = self.get_queryset().filter(
                participants__team__status=TeamStatus.INVISIBLE
            )
            queryset = queryset.exclude(pk__in=Subquery(has_invisible.values("pk")))
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="team_id",
                type=int,
                description="A team to filter for. Defaults to your own team.",
            ),
        ],
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="No ranked matches found."
            ),
            status.HTTP_200_OK: HistoricalRatingSerializer(many=True),
        },
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsEpisodeMutable,),
    )
    def historical_rating(self, request, pk=None, *, episode_id):
        """List the historical rating of a team."""
        queryset = Match.objects.all().filter(tournament_round__isnull=True)

        team_id = parse_int(self.request.query_params.get("team_id"))
        if team_id is not None:
            queryset = queryset.filter(participants__team=team_id)
        elif request.user.pk is not None:
            queryset = queryset.filter(participants__team__members=request.user.pk)
        else:
            return Response([])
        has_invisible = self.get_queryset().filter(
            participants__team__status=TeamStatus.INVISIBLE
        )
        queryset = queryset.exclude(pk__in=Subquery(has_invisible.values("pk")))
        queryset = queryset.filter(is_ranked=True)

        matches = queryset.all().order_by("created")

        ordered = [
            {
                "timestamp": match.created,
                "rating": match.participants.get(team=team_id).rating
                if team_id is not None
                else match.participants.get(team__members__pk=request.user.pk).rating,
            }
            for match in matches
        ]

        results = HistoricalRatingSerializer(ordered, many=True).data
        return Response(results, status=status.HTTP_200_OK)

    @extend_schema(
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Report has been received"
            ),
            status.HTTP_409_CONFLICT: OpenApiResponse(
                description="This match was already finalized"
            ),
        }
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=MatchReportSerializer,
        throttle_classes=(),
    )
    def report(self, request, pk=None, *, episode_id):
        """
        Report the outcome of this match on Saturn.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=None,
        throttle_classes=(),
    )
    def rating_update(self, request, pk=None, *, episode_id):
        """
        Try to finalize the rating of this match.
        """
        instance = self.get_object()
        instance.try_rating_update()
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=None,
        throttle_classes=(),
    )
    def publish_public_bracket(self, request, pk=None, *, episode_id):
        """Publish the result of a tournament match to the public bracket."""
        instance = self.get_object()
        instance.report_to_bracket(is_private=False)
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class ScrimmageRequestViewSet(
    EpisodeTeamUserContextMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    A viewset for creating and responding to Scrimmage Requests.
    """

    serializer_class = ScrimmageRequestSerializer

    def get_queryset(self):
        queryset = ScrimmageRequest.objects.filter(episode=self.kwargs["episode_id"])
        match self.action:
            case "destroy":
                queryset = queryset.filter(
                    requested_by__members=self.request.user,
                    status=ScrimmageRequestStatus.PENDING,
                )
            case "outbox":
                queryset = (
                    queryset.filter(
                        requested_by__members=self.request.user,
                        status=ScrimmageRequestStatus.PENDING,
                    )
                    .select_related("requested_to__profile__rating")
                    .prefetch_related("requested_to__members", "maps")
                    .order_by("-pk")
                )
            case "accept" | "reject":
                queryset = queryset.filter(
                    requested_to__members=self.request.user,
                    status=ScrimmageRequestStatus.PENDING,
                )
            case "inbox":
                queryset = (
                    queryset.filter(
                        requested_to__members=self.request.user,
                        status=ScrimmageRequestStatus.PENDING,
                    )
                    .select_related("requested_by__profile__rating")
                    .prefetch_related("requested_by__members", "maps")
                    .order_by("-pk")
                )
        return queryset

    def get_permissions(self):
        match self.action:
            case "create":
                return [
                    IsAuthenticated(),
                    IsOnTeam(),
                    (IsEpisodeMutable | IsAdminUser)(),
                    HasTeamSubmission(),
                ]
            case "destroy":
                return [
                    IsAuthenticated(),
                    IsOnTeam(),
                    IsEpisodeAvailable(),
                ]
            case "list" | "retrieve":
                return [IsAuthenticated(), IsOnTeam(), IsEpisodeAvailable()]
            case _:
                return super().get_permissions()

    def create(self, request, *, episode_id):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data["is_ranked"]:
            active_statuses = {
                SaturnStatus.CREATED,
                SaturnStatus.QUEUED,
                SaturnStatus.RUNNING,
                SaturnStatus.RETRY,
            }
            existing_requests = ScrimmageRequest.objects.filter(
                requested_by=serializer.validated_data["requested_by_id"],
                requested_to=serializer.validated_data["requested_to"],
                is_ranked=True,
                status=ScrimmageRequestStatus.PENDING,
            ).count()
            existing_matches = (
                Match.objects.annotate(
                    has_requester=Exists(
                        MatchParticipant.objects.filter(
                            match=OuterRef("pk"),
                            team=serializer.validated_data["requested_by_id"],
                        )
                    ),
                    has_requestee=Exists(
                        MatchParticipant.objects.filter(
                            match=OuterRef("pk"),
                            team=serializer.validated_data["requested_to"],
                        )
                    ),
                )
                .filter(
                    has_requester=True,
                    has_requestee=True,
                    status__in=active_statuses,
                    is_ranked=True,
                )
                .count()
            )
            if (
                existing_requests + existing_matches
                >= settings.MAX_SCRIMMAGES_AGAINST_TEAM
            ):
                raise TooManyScrimmages

        serializer.save()
        # Generate the Location header, as supplied by CreateModelMixin
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @extend_schema(
        responses={status.HTTP_200_OK: ScrimmageRequestSerializer(many=True)}
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsAuthenticated, IsEpisodeAvailable, IsOnTeam),
    )
    def inbox(self, request, *, episode_id):
        """Get all pending scrimmage requests received."""
        queryset = self.get_queryset().filter(
            Q(requested_to__members=request.user),
            status=ScrimmageRequestStatus.PENDING,
        )
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(
        responses={status.HTTP_200_OK: ScrimmageRequestSerializer(many=True)}
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsAuthenticated, IsEpisodeAvailable, IsOnTeam),
    )
    def outbox(self, request, *, episode_id):
        """Get all pending scrimmage requests sent."""
        queryset = self.get_queryset().filter(
            Q(requested_by__members=request.user),
            status=ScrimmageRequestStatus.PENDING,
        )
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(
        request=None,
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Scrimmage request has been accepted"
            )
        },
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(
            IsAuthenticated,
            IsOnTeam,
            IsEpisodeMutable | IsAdminUser,
            HasTeamSubmission,
        ),
    )
    @transaction.atomic
    def accept(self, request, pk=None, *, episode_id):
        """Accept a scrimmage request."""
        self.get_object()  # Asserts permission
        self.get_queryset().filter(pk=pk).accept()
        return Response(None, status.HTTP_204_NO_CONTENT)

    @extend_schema(
        request=None,
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Scrimmage request has been rejected"
            )
        },
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAuthenticated, IsOnTeam, IsEpisodeAvailable),
    )
    def reject(self, request, pk=None, *, episode_id):
        """Reject a scrimmage request."""
        self.get_object()  # Asserts permission
        self.get_queryset().filter(pk=pk).reject()
        return Response(None, status.HTTP_204_NO_CONTENT)

    def destroy(self, request, pk=None, *, episode_id):
        """Cancel a scrimmage request."""
        self.get_object()  # Asserts permission
        self.get_queryset().filter(pk=pk).cancel()
        return Response(None, status.HTTP_204_NO_CONTENT)
