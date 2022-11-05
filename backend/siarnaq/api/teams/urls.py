from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.teams import views

router = DefaultRouter()
router.register("all-info", views.TeamViewSet, basename="all-info")

urlpatterns = [path("", include(router.urls))]
