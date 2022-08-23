# from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from siarnaq.api.accounts.models import User, UserProfile
from siarnaq.api.accounts.serializers import UserProfileSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for dealing with user authorization.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    queryset = User.objects.all()
    pass


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for providing user profile information.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()
    pass
