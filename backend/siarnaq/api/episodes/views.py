from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from siarnaq.api.episodes.models import Episode, Map, Tournament, TournamentRound
from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.episodes.serializers import (
    AutoscrimSerializer,
    EpisodeSerializer,
    MapSerializer,
    TournamentRoundSerializer,
    TournamentSerializer,
)


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
            .order_by("external_id")
        )
        if not self.request.user.is_staff:
            queryset = queryset.filter(tournament__is_public=True)
        return queryset
