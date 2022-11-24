from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.compete import views

router = DefaultRouter()
router.register(
    r"(?P<episode_id>[^\/.]+)/submission",
    views.SubmissionViewSet,
    basename="submission",
)
router.register(r"(?P<episode_id>[^\/.]+)/match", views.MatchViewSet, basename="match")
router.register(
    r"(?P<episode_id>[^\/.]+)/request",
    views.ScrimmageRequestViewSet,
    basename="request",
)

urlpatterns = [
    path("", include(router.urls)),
]
