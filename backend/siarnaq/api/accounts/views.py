# from django.shortcuts import render
from rest_framework import viewsets

from siarnaq.api.accounts.models import UserProfile
from siarnaq.api.accounts.serializers import UserProfileSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for updating and retrieving user profile information.
    """

    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()
    pass
