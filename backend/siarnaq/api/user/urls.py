from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.user import views

router = DefaultRouter()
router.register("u", views.UserViewSet, basename="user")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "password_reset/",
        include("django_rest_passwordreset.urls", namespace="password_reset"),
    ),
    path("verify_email/", include("django_email_verification.urls")),
]
