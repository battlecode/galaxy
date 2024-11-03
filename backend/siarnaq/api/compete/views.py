from functools import reduce
from typing import Optional

import google.cloud.storage as storage
import structlog
from django.conf import settings
from django.contrib.postgres.aggregates import ArrayAgg
from django.db import NotSupportedError, transaction
from django.db.models import Exists, F, Max, OuterRef, Q, Subquery
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
    EmptySerializer,
    HistoricalRatingSerializer,
    MatchReportSerializer,
    MatchSerializer,
    ScrimmageRecordSerializer,
    ScrimmageRequestSerializer,
    SubmissionDownloadSerializer,
    SubmissionReportSerializer,
    SubmissionSerializer,
    TournamentSubmissionSerializer,
)
from siarnaq.api.episodes.models import ReleaseStatus, Tournament
from siarnaq.api.episodes.permissions import IsEpisodeAvailable, IsEpisodeMutable
from siarnaq.api.teams.models import Rating, Team, TeamStatus
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

    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "package": {"type": "string"},
                    "description": {"type": "string"},
                    "source_code": {"type": "string", "format": "binary"},
                },
            }
        },
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

    @extend_schema(
        # https://drf-spectacular.readthedocs.io/en/latest/faq.html#i-m-using-action-detail-false-but-the-response-schema-is-not-a-list
        responses=TournamentSubmissionSerializer(many=True)
    )
    @action(
        detail=False,
        methods=["get"],
        serializer_class=TournamentSubmissionSerializer,
        # needed so that the generated schema is not paginated
        pagination_class=None,
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
        """
        List matches played in a tournament, or in all tournaments if not specified.
        Passing the external_id_private of a tournament allows match lookup for the
        tournament, even if it's private. Client uses the external_id_private parameter
        """
        queryset = self.get_queryset()

        external_id_private = self.request.query_params.get("external_id_private")
        tournaments = None
        if external_id_private is not None:
            # If an external id is provided, filter tournaments by it
            tournaments = Tournament.objects.visible_to_user(is_staff=True)
            tournaments = tournaments.filter(external_id_private=external_id_private)
            if not tournaments.exists():
                return Response(None, status=status.HTTP_404_NOT_FOUND)
        else:
            # Otherwise filter by provided tournament id
            tournaments = Tournament.objects.visible_to_user(
                is_staff=request.user.is_staff
            )
            tournament_id = self.request.query_params.get("tournament_id")
            if tournament_id is not None:
                tournaments = tournaments.filter(pk=tournament_id)
                if not tournaments.exists():
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

    def get_historical_rating_ranking(self, episode_id, queryset, limit=None):

        has_invisible = self.get_queryset().filter(
            participants__team__status=TeamStatus.INVISIBLE
        )
        matches = (
            (
                queryset.filter(episode=episode_id)
                .filter(tournament_round__isnull=True)
                .exclude(pk__in=Subquery(has_invisible.values("pk")))
                .filter(is_ranked=True)
                .filter(participants__rating__isnull=False)
            )
            .all()
            .order_by("-created")
        )

        # query aggregate rating history per each team order by
        # max_rating and limit by 10
        matching_participants = MatchParticipant.objects.all().filter(match__in=matches)
        rating_history = (
            matching_participants.values("team_id")
            .annotate(
                timestamps_list=ArrayAgg(
                    F("match__created"), ordering="match__created"
                ),
                ratings_pk_list=ArrayAgg(F("rating__pk"), ordering="match__created"),
                max_rating=Max("rating__value"),
            )
            .all()
            .order_by("-max_rating")[:limit]
        )
        # parse query result in format required by serializer
        # query returns team, rating as pk but we serializer
        # needs pointer to team, rating objects
        grouped = [
            {
                "team_id": team_data["team_id"],
                "team_rating": {
                    "team": Team.objects.get(pk=team_data["team_id"]),
                    "rating_history": [
                        {
                            "timestamp": timestamp,
                            "rating": Rating.objects.get(pk=rating_pk),
                        }
                        for rating_pk, timestamp in zip(
                            team_data["ratings_pk_list"], team_data["timestamps_list"]
                        )
                    ],
                },
            }
            for team_data in rating_history
        ]
        return grouped

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="team_ids",
                type=int,
                description="A list of teams to filter for. Defaults to your own team.",
                many=True,
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
        # needed so that the generated schema is not paginated
        pagination_class=None,
    )
    def historical_rating(self, request, pk=None, *, episode_id):
        """List the historical ratings of a list of teams."""
        team_ids = self.request.query_params.getlist("team_ids")
        if team_ids is not None and len(team_ids) > 0:
            team_ids = {parse_int(team_id) for team_id in team_ids}
        elif request.user.pk is not None:
            team_ids = {
                team.id
                for team in Team.objects.filter(members__pk=request.user.pk).filter(
                    episode_id=episode_id
                )
            }
        else:
            return Response([])

        queryset = Match.objects.all().filter(participants__team__in=team_ids)
        grouped = self.get_historical_rating_ranking(episode_id, queryset)
        results = HistoricalRatingSerializer(grouped, many=True).data
        return Response(results, status=status.HTTP_200_OK)

    @extend_schema(
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
        # needed so that the generated schema is not paginated
        pagination_class=None,
    )
    def historical_rating_top10(self, request, pk=None, *, episode_id):
        """List the historical top 10 rankings"""
        # filter matches

        queryset = Match.objects.all()
        grouped = self.get_historical_rating_ranking(
            episode_id=episode_id, queryset=queryset, limit=10
        )
        results = HistoricalRatingSerializer(grouped, many=True).data
        return Response(results, status=status.HTTP_200_OK)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="team_id",
                type=int,
                description="A team to filter for. Defaults to your own team.",
            ),
            OpenApiParameter(
                name="scrimmage_type",
                enum=["ranked", "unranked", "all"],
                default="all",
                description="Which type of scrimmages to filter for. Defaults to all.",
            ),
        ],
        responses={
            status.HTTP_200_OK: ScrimmageRecordSerializer(),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="No team found with the given ID."
            ),
        },
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsEpisodeMutable,),
    )
    def scrimmaging_record(self, request, pk=None, *, episode_id):
        """List the scrimmaging win-loss-tie record of a team."""
        queryset = self.get_queryset().filter(tournament_round__isnull=True)

        scrimmage_type = self.request.query_params.get("scrimmage_type")
        if scrimmage_type is not None:
            if scrimmage_type == "ranked":
                queryset = queryset.filter(is_ranked=True)
            elif scrimmage_type == "unranked":
                queryset = queryset.filter(is_ranked=False)

        team_id = parse_int(self.request.query_params.get("team_id"))
        if team_id is None and request.user.pk is not None:
            team_id = (
                Team.objects.filter(members__pk=request.user.pk)
                .filter(episode_id=episode_id)
                .first()
                .id
            )
            if team_id is None:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        if team_id is not None:
            queryset = queryset.filter(participants__team=team_id)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        has_invisible = self.get_queryset().filter(
            participants__team__status=TeamStatus.INVISIBLE
        )
        queryset = queryset.exclude(pk__in=Subquery(has_invisible.values("pk")))

        def match_handler(record, match):
            """Mutate the win-loss-tie record based on the match outcome."""
            this_team = match.participants.filter(team=team_id).first()
            other_team = match.participants.exclude(team=team_id).first()
            if this_team is None or other_team is None:
                return record
            if this_team.score is None or other_team.score is None:
                return record
            if this_team.score > other_team.score:
                record["wins"] += 1
            elif this_team.score < other_team.score:
                record["losses"] += 1
            else:
                record["ties"] += 1
            return record

        win_loss_tie = reduce(
            match_handler,
            queryset.all(),
            {
                "team_id": team_id,
                "wins": 0,
                "losses": 0,
                "ties": 0,
            },
        )
        results = ScrimmageRecordSerializer(win_loss_tie).data
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
        serializer_class=EmptySerializer,
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
        serializer_class=EmptySerializer,
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
