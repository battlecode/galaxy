from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.episodes import views

router = DefaultRouter()
router.register("e", views.EpisodeViewSet, basename="episode")
router.register(
    r"(?P<episode_id>[^\/.]+)/map",
    views.MapViewSet,
    basename="map",
)
router.register(
    r"(?P<episode_id>[^\/.]+)/tournament",
    views.TournamentViewSet,
    basename="tournament",
)
router.register(
    r"(?P<episode_id>[^\/.]+)/tournament/(?P<tournament>[^\/.]+)/round",
    views.TournamentRoundViewSet,
    basename="tournament-round",
)

urlpatterns = [
    path("", include(router.urls)),
]
