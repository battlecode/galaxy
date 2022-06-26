from django.contrib.auth import get_user_model
from rest_framework import mixins, viewsets
from rest_framework.pagination import PageNumberPagination

from siarnaq.api.accounts.models import UserProfile
from siarnaq.api.accounts.serializers import UserProfileSerializer, UserSerializer


class UserViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = UserSerializer
    queryset = get_user_model().objects.all()


class UserProfilePagination(PageNumberPagination):
    page_size = 20


class UserProfileViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()
    pagination_class = UserProfilePagination
