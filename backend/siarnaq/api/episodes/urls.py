from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.episodes import views

router = DefaultRouter()
router.register("e", views.EpisodeViewSet, basename="episode")

urlpatterns = [
    path("", include(router.urls)),
]
