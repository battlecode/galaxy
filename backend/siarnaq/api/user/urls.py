from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.user import views

router = DefaultRouter()
router.register("profile", views.UserProfileViewSet, basename="profile")

urlpatterns = [
    path("", include(router.urls)),
]
