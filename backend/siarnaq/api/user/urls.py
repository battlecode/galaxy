from django.urls import include, path
from rest_framework.routers import DefaultRouter

from siarnaq.api.user import views

router = DefaultRouter()
router.register("detail", views.UserProfileViewSet, basename="user-detail")
router.register("public", views.PublicUserProfileViewSet, basename="public")

urlpatterns = [
    path("", include(router.urls)),
]
