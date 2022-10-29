from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.teams import views

router = DefaultRouter()
router.register("all", views.TeamViewSet, basename="all")

urlpatterns = [path("", include(router.urls))]
