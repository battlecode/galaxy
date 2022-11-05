from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.user import views

router = DefaultRouter()
router.register("all-info", views.UserProfileViewSet, basename="all-info")
router.register("public", views.PublicUserProfileViewSet, basename="public")

urlpatterns = [
    path("", include(router.urls)),
]
