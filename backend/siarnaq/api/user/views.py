import io

import google.cloud.storage as storage
from django.db import transaction
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from PIL import Image
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

import siarnaq.gcloud as gcloud
from siarnaq.api.user.models import UserProfile
from siarnaq.api.user.permissions import IsAuthenticatedAsRequestedUser
from siarnaq.api.user.serializers import (
    PublicUserProfileSerializer,
    UserAvatarSerializer,
    UserProfileSerializer,
    UserResumeSerializer,
)


class UserProfileViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
):
    """
    A viewset for retrieving and updating all user info.
    When "current" is provided for the ID, retrieve/update info for logged in user.
    """

    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticatedAsRequestedUser,)

    def get_queryset(self):
        return UserProfile.objects.select_related("user").all()

    def get_object(self):
        """
        If provided ID is "current", set object to logged in user.
        See https://stackoverflow.com/a/36626403.
        """
        pk = self.kwargs.get("pk")

        if pk == "current":
            return get_object_or_404(
                self.get_queryset().filter(pk=self.request.user.pk)
            )

        return super().get_object()

    @action(detail=True, methods=["get", "put"], serializer_class=UserResumeSerializer)
    def resume(self, request, pk=None):
        """Retrieve or update the uploaded resume."""
        profile = self.get_object()
        match request.method.lower():
            case "get":
                if not profile.has_resume:
                    raise Http404
                client = storage.Client(credentials=gcloud.credentials)
                blob = client.bucket(gcloud.secure_bucket).blob(
                    profile.get_resume_path()
                )
                if gcloud.enable_actions:
                    data = blob.open("rb")
                else:
                    data = io.BytesIO()
                return FileResponse(data, filename="resume.pdf")

            case "put":
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                resume = serializer.validated_data["resume"]
                with transaction.atomic():
                    profile.has_resume = True
                    profile.save(update_fields=["has_resume"])
                    if gcloud.enable_actions:
                        client = storage.Client(credentials=gcloud.credentials)
                        blob = client.bucket(gcloud.secure_bucket).blob(
                            profile.get_resume_path()
                        )
                        with blob.open("wb") as f:
                            for chunk in resume.chunks():
                                f.write(chunk)
                    blob.metadata = {"Content-Type": "application/pdf"}
                    blob.patch()
                return Response(serializer.data)

            case _:
                raise RuntimeError(f"Fallthrough! Was {request.method} implemented?")

    @action(detail=True, methods=["post"], serializer_class=UserAvatarSerializer)
    def avatar(self, request, pk=None):
        """updates uploaded avatar"""
        profile = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        avatar = serializer.validated_data["avatar"]

        MAX_AVATAR_SIZE = (512, 512)
        img = Image.open(avatar)
        img.thumbnail(MAX_AVATAR_SIZE)

        # Prepare image bytes for upload to Google Cloud
        # See https://stackoverflow.com/a/71094317
        bytestream = io.BytesIO()
        img.save(bytestream, format="png")
        img_bytes = bytestream.getvalue()

        with transaction.atomic():
            profile.has_avatar = True
            profile.save(update_fields=["has_avatar"])
            if gcloud.enable_actions:
                client = storage.Client()
                blob = client.bucket(gcloud.public_bucket).blob(
                    profile.get_avatar_path()
                )
                blob.upload_from_string(img_bytes)

        return Response(serializer.data)


class PublicUserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving public user info.
    """

    serializer_class = PublicUserProfileSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return UserProfile.objects.all()
