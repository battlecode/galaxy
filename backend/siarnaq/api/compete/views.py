from typing import Optional

import google.cloud.storage as storage
import structlog
from django.conf import settings
from django.db import NotSupportedError, transaction
from django.db.models import (
    Case,
    Exists,
    F,
    IntegerField,
    OuterRef,
    Q,
    Subquery,
    Sum,
    Value,
    When,
)
from django.db.models.functions import Coalesce
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

    def get_historical_rating(self, episode_id, teams):
        """
        helper function to return historical ratings for all given teams
        in the given episode
        """
        teams_ids = [team.pk for team in teams]
        logger.debug(f"Matchparticipant count: {MatchParticipant.objects.count()}")
        # get all teams data in one query
        match_participants = (
            MatchParticipant.objects.filter(
                team_id__in=teams_ids,
                match__episode=episode_id,
                match__tournament_round__isnull=True,
                match__is_ranked=True,
                rating__isnull=False,
            )
            .exclude(match__participants__team__status=TeamStatus.INVISIBLE)
            .select_related("match", "rating")
            .order_by("match__created")
        )
        logger.debug(f"match_participants query plan: {match_participants.query}")

        logger.debug(f"match_participants count: {match_participants.count()}")
        # Prepare rating history
        teams_rating_history = [
            [
                {
                    "timestamp": match_data.match.created,
                    "rating": match_data.rating,
                }
                for match_data in match_participants.filter(team_id=team_id)
            ]
            for team_id in teams_ids
        ]

        historical_rating = [
            {
                "team_id": team.pk,
                "team_rating": {
                    "team": team,
                    "rating_history": rating_history,
                },
            }
            for team, rating_history in zip(teams, teams_rating_history)
        ]

        return historical_rating

    def get_rated_matches(self, episode_id, team_id=None):
        """
        Retrieve matches with valid ratings for a specific episode.

        This helper function returns a QuerySet of matches that are ranked and have
        valid ratings for participants in a given episode. The matches are filtered
        to exclude those with participants from teams with an 'INVISIBLE' status.
        Additionally, matches that are part of a tournament round are excluded.

        Parameters:
        - episode_id (int): The identifier of the episode to filter matches by.
        - team_id (int, optional): If provided, further filters the matches to
        include only those where the specified team participated.

        Returns:
        - QuerySet: A Django QuerySet containing matches that meet the specified
        criteria, ordered by creation date in descending order.
        """
        has_invisible = self.get_queryset().filter(
            participants__team__status=TeamStatus.INVISIBLE
        )
        matches = (
            self.get_queryset()
            .filter(episode=episode_id)
            .filter(tournament_round__isnull=True)
            .exclude(pk__in=Subquery(has_invisible.values("pk")))
            .filter(is_ranked=True)
            .filter(participants__rating__isnull=False)
            .order_by("-created")
        )
        if team_id is not None:
            matches = matches.filter(participants__team=team_id)

        return matches

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="team_id",
                type=int,
                description="Optional teamID to filter for. Defaults to your own team.",
                required=False,
            ),
        ],
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="No ranked matches found."
            ),
            status.HTTP_200_OK: HistoricalRatingSerializer(many=False),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Could not find requested team."
            ),
        },
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsEpisodeMutable,),
        pagination_class=None,
    )
    def historical_rating(self, request, pk=None, *, episode_id):
        """
        Provides a list of historical ratings for a team in a given episode.
        Supports filtering by team ID or defaults to the current user's team
        if no team ID is provided.

        Parameters:
            - request (Request) - The HTTP request object.
            - pk (int, optional) - The primary key of the object. Defaults to None.
            - episode_id (int) - The ID of the episode to filter the ratings by.

        Query Parameters:
            - team_id (int, optional) - The team ID for which to retrieve
            historical ratings. If not provided, defaults to the team of the
            requesting user.

        Returns:
            Response: A JSON response containing:
                - 200 OK: Returns a serialized representation of the team's
                historical ratings if found.
                - 204 No Content: If no ranked matches are found for the specified team.
                - 400 Bad Request: If the specified team could not be found.

        Raises:
            - 400 Bad Request: If neither a valid team ID is provided nor can a team be
            determined from the current user.

        Permissions:
            Requires `IsEpisodeMutable` permission class.

        Notes:
            - The function does not paginate results.
            - The function returns an empty list if no valid team is found.
            - Historical ratings are ordered by match creation date.
        """
        team_id = self.request.query_params.get("team_id")

        if team_id is not None:
            team_query = Team.objects.filter(
                episode_id=episode_id, pk=parse_int(team_id)
            )
        elif request.user.pk is not None:
            team_query = Team.objects.filter(
                members__pk=request.user.pk, episode_id=episode_id
            )
        else:
            return Response([])

        if not team_query.exists():
            return Response(status=status.HTTP_400_BAD_REQUEST)

        team = team_query.get()
        historical_rating = self.get_historical_rating(episode_id, [team])[0]
        results = HistoricalRatingSerializer(historical_rating, many=False).data
        return Response(results, status=status.HTTP_200_OK)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="N",
                type=int,
                description="number of top teams to get ratings for, defaults to 10",
                required=False,
            ),
        ],
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="No ranked matches found."
            ),
            status.HTTP_200_OK: HistoricalRatingSerializer(many=True),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Invalid parameter: N must be less than or equal to 10"
            ),
        },
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsEpisodeMutable,),
        # needed so that the generated schema is not paginated
        pagination_class=None,
    )
    def historical_rating_topN(self, request, pk=None, *, episode_id):
        """List the historical top N rankings, N should be <= 10 and defaults to 10"""
        # return Response(status=status.HTTP_204_NO_CONTENT)

        N = request.query_params.get("N", 10)

        try:
            N = parse_int(N)
        except ValueError:
            return Response(
                {"error": "Invalid parameter: N must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if N > 10:
            return Response(
                {"error": "Invalid parameter: N must be less than or equal to 10"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # get top limit teams
        top_teams = Team.objects.filter(episode=episode_id).order_by(
            "-profile__rating__value"
        )[:N]
        logger.debug(f"top 10 teams: {top_teams.query}")

        grouped = self.get_historical_rating(episode_id, top_teams)

        results = HistoricalRatingSerializer(grouped, many=True).data
        return Response(results, status=status.HTTP_200_OK)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="team_id",
                type=int,
                description="A team to filter for. Defaults to your own team.",
            ),
            # OpenApiParameter(
            #     name="scrimmage_type",
            #     enum=["ranked", "unranked", "all"],
            #     default="all",
            #     description="Which type of scrimmages to filter for.Defaults to all.",
            # ),
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
        """
        Retrieve the scrimmaging win-loss-tie record for a team.

        Returns a JSON object containing the team's record in ranked,
        unranked, and overall matches.
        The record is broken down into wins, losses, and ties for each category.

        Query Parameters:
        - team_id (optional): ID of the team to retrieve the record for.
                              If not provided, uses the authenticated user's team.

        Returns:
        - 200 OK: Successfully retrieved the team's scrimmaging record.
        - 400 Bad Request: If no team_id is provided and the user is not associated
                              with a team, or if the provided team_id is invalid.
        """
        team_id = parse_int(request.query_params.get("team_id"))
        if team_id is None and request.user.pk is not None:
            user_team = Team.objects.filter(
                members__pk=request.user.pk, episode_id=episode_id
            ).first()

            if not user_team:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            team_id = user_team.id
        elif team_id is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        queryset = (
            self.get_queryset()
            .filter(tournament_round__isnull=True, participants__team_id=team_id)
            .exclude(participants__team__status=TeamStatus.INVISIBLE)
        )

        # Annotate the queryset to perform logic on the database side
        results = queryset.annotate(
            this_team_score=Sum(
                Case(
                    When(participants__team_id=team_id, then="participants__score"),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ),
            other_team_score=Sum(
                Case(
                    When(~Q(participants__team_id=team_id), then="participants__score"),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ),
        ).aggregate(
            ranked_wins=Coalesce(
                Sum(
                    Case(
                        When(
                            Q(this_team_score__gt=F("other_team_score"))
                            & Q(is_ranked=True),
                            then=1,
                        ),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                0,
            ),
            ranked_losses=Coalesce(
                Sum(
                    Case(
                        When(
                            Q(this_team_score__lt=F("other_team_score"))
                            & Q(is_ranked=True),
                            then=1,
                        ),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                0,
            ),
            ranked_ties=Coalesce(
                Sum(
                    Case(
                        When(
                            Q(this_team_score=F("other_team_score"))
                            & Q(is_ranked=True),
                            then=1,
                        ),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                0,
            ),
            unranked_wins=Coalesce(
                Sum(
                    Case(
                        When(
                            Q(this_team_score__gt=F("other_team_score"))
                            & Q(is_ranked=False),
                            then=1,
                        ),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                0,
            ),
            unranked_losses=Coalesce(
                Sum(
                    Case(
                        When(
                            Q(this_team_score__lt=F("other_team_score"))
                            & Q(is_ranked=False),
                            then=1,
                        ),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                0,
            ),
            unranked_ties=Coalesce(
                Sum(
                    Case(
                        When(
                            Q(this_team_score=F("other_team_score"))
                            & Q(is_ranked=False),
                            then=1,
                        ),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                0,
            ),
        )

        win_loss_tie = {
            "team_id": team_id,
            "Ranked": {
                "wins": results["ranked_wins"],
                "losses": results["ranked_losses"],
                "ties": results["ranked_ties"],
            },
            "Unranked": {
                "wins": results["unranked_wins"],
                "losses": results["unranked_losses"],
                "ties": results["unranked_ties"],
            },
            "All": {
                "wins": results["ranked_wins"] + results["unranked_wins"],
                "losses": results["ranked_losses"] + results["unranked_losses"],
                "ties": results["ranked_ties"] + results["unranked_ties"],
            },
        }

        serialized_results = ScrimmageRecordSerializer(win_loss_tie).data
        return Response(serialized_results, status=status.HTTP_200_OK)

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
