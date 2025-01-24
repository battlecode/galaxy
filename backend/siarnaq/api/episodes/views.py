from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from siarnaq.api.episodes.models import Episode, Map, Tournament, TournamentRound
from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.episodes.serializers import (
    AutoscrimSerializer,
    EmptySerializer,
    EpisodeSerializer,
    MapSerializer,
    TournamentRoundSerializer,
    TournamentSerializer,
)


class NoMatchesToRequeue(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "No failed matches to requeue"
    default_code = "no_failed_matches"


class RoundInProgress(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Round is already in progress"
    default_code = "round_in_progress"


class EpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving Episodes.
    """

    serializer_class = EpisodeSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return Episode.objects.visible_to_user(
            is_staff=self.request.user.is_staff
        ).order_by("-registration")

    @extend_schema(
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Created successfully"
            )
        }
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=AutoscrimSerializer,
        throttle_classes=(),
    )
    def autoscrim(self, request, pk=None):
        """Trigger a round of autoscrimmages."""
        episode = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        episode.autoscrim(serializer.validated_data["best_of"])
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class MapViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving Maps.
    """

    serializer_class = MapSerializer
    permission_classes = (IsEpisodeAvailable,)
    pagination_class = None

    def get_queryset(self):
        queryset = Map.objects.filter(episode=self.kwargs["episode_id"])
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_public=True)
        return queryset


class TournamentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving Tournaments.
    """

    serializer_class = TournamentSerializer
    permission_classes = (IsEpisodeAvailable,)

    def get_queryset(self):
        queryset = (
            Tournament.objects.filter(episode=self.kwargs["episode_id"])
            .order_by("submission_freeze")
            .prefetch_related("eligibility_includes", "eligibility_excludes")
        )
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_public=True)
        return queryset

    @action(detail=False, methods=["get"])
    def next(self, request, episode_id):
        "Retrieve the next upcoming tournament, as ordered by submission freeze time."
        now = timezone.now()
        next_tournament = get_object_or_404(
            self.get_queryset().filter(submission_freeze__gt=now)[:1]
        )
        serializer = self.get_serializer(next_tournament)
        return Response(serializer.data)

    @extend_schema(
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Tournament has been initialized"
            ),
        }
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=EmptySerializer,
        throttle_classes=(),
    )
    def initialize(self, request, pk=None, *, episode_id):
        """
        Seed the tournament with eligible teams in order of decreasing rating,
        populate the brackets in the bracket service, and create TournamentRounds.
        """
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance.initialize()
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class TournamentRoundViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving tournament rounds.
    """

    serializer_class = TournamentRoundSerializer
    permission_classes = (IsEpisodeAvailable,)

    def get_queryset(self):
        queryset = (
            TournamentRound.objects.filter(
                tournament__episode=self.kwargs["episode_id"],
                tournament=self.kwargs["tournament"],
            )
            .prefetch_related("maps")
            .order_by("display_order")
        )
        if not self.request.user.is_staff:
            queryset = queryset.filter(tournament__is_public=True)
        return queryset

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="episode_id",
                type=str,
                description="An episode to filter for.",
            ),
            OpenApiParameter(
                name="tournament",
                type=str,
                description="A tournament to filter for.",
            ),
            OpenApiParameter(
                name="id",
                type=str,
                description="A tournament round to filter for.",
            ),
            OpenApiParameter(
                name="maps",
                type=int,
                many=True,
                required=True,
                description="List of map IDs to use in this round.",
            ),
        ],
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Tournament round has been enqueued"
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Tournament round could not be enqueued"
            ),
            status.HTTP_409_CONFLICT: OpenApiResponse(
                description="Tournament round is already in progress"
            ),
        },
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=EmptySerializer,
    )
    def enqueue(self, request, pk=None, *, episode_id, tournament):
        """
        Enqueue the given round of the tournament.
        Fails if this round is already in progress.
        """
        instance = self.get_object()

        # Set the tournament round's maps to the provided list
        old_maps = instance.maps.all()

        map_ids = self.request.query_params.getlist("maps")
        map_objs = Map.objects.filter(episode_id=episode_id, id__in=map_ids)
        maps = sorted(list(map_objs), key=lambda m: map_ids.index(str(m.id)))

        # We require an odd number of maps to prevent ties
        if len(maps) % 2 == 0:
            return Response(None, status=status.HTTP_400_BAD_REQUEST)

        instance.maps.set(maps)

        # Attempt to enqueue the round
        try:
            instance.enqueue()
        except RuntimeError:
            # Revert the maps if enqueueing failed
            instance.maps.set(old_maps)
            raise RoundInProgress()

        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="episode_id",
                type=str,
                description="An episode to filter for.",
            ),
            OpenApiParameter(
                name="tournament",
                type=str,
                description="A tournament to filter for.",
            ),
            OpenApiParameter(
                name="id",
                type=str,
                description="A tournament round to filter for.",
            ),
        ],
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description=(
                    "Tournament round has been released to public bracket service"
                )
            ),
        },
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=EmptySerializer,
        throttle_classes=(),
    )
    def release(self, request, pk=None, *, episode_id, tournament):
        """
        Release the results of this round to the public bracket service.
        """
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance.request_publish_to_bracket(is_public=True)
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Tournament round has been requeued"
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="No failed matches to requeue"
            ),
        }
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=EmptySerializer,
        throttle_classes=(),
    )
    def requeue(self, request, pk=None, *, episode_id, tournament):
        """
        Re-queue every unsuccessful match in this round on Saturn.
        """
        from siarnaq.api.compete.models import Match, SaturnStatus

        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get all failed matches for this round
        failed = Match.objects.filter(
            tournament_round=instance.id, status=SaturnStatus.ERRORED
        )

        if not failed.exists():
            raise NoMatchesToRequeue()

        # TODO: should we logger.info the round requeue here?
        failed.enqueue_all()

        return Response(None, status=status.HTTP_204_NO_CONTENT)
