from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.teams import views

router = DefaultRouter()
router.register("detail", views.TeamViewSet, basename="teams-detail")

urlpatterns = [path("", include(router.urls))]
