# from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from siarnaq.api.accounts.models import UserProfile
from siarnaq.api.accounts.serializers import UserProfileSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for retrieving and updating user profiles.
    """

    serializer_class = UserProfileSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return UserProfile.objects.all()
