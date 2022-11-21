from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.user import views

router = DefaultRouter()
router.register("detail", views.UserProfileViewSet, basename="user-detail")
router.register("public", views.PublicUserProfileViewSet, basename="user-public")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "password_reset/",
        include("django_rest_passwordreset.urls", namespace="password_reset"),
    ),
]
