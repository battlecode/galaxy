from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.teams import views

router = DefaultRouter()
router.register(
    r"(?P<episode_id>.+)/detail", views.TeamViewSet, basename="teams-detail"
)
router.register(
    r"(?P<episode_id>.+)/public", views.PublicTeamProfileViewSet, basename="team-public"
)

urlpatterns = [path("", include(router.urls))]
