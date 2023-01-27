from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.teams import views

router = DefaultRouter()
router.register(r"(?P<episode_id>[^\/.]+)/t", views.TeamViewSet, basename="team")
router.register(
    r"(?P<episode_id>[^\/.]+)/requirement",
    views.ClassRequirementViewSet,
    basename="requirement",
)

urlpatterns = [path("", include(router.urls))]
