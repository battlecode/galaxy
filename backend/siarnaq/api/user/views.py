import io
import uuid

import google.cloud.storage as storage
from django.conf import settings
from django.db import transaction
from django.http import Http404
from PIL import Image
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.user.models import User
from siarnaq.api.user.serializers import (
    UserAvatarSerializer,
    UserPrivateSerializer,
    UserPublicSerializer,
    UserResumeSerializer,
)
from siarnaq.gcloud import titan


class UserViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
):
    """
    A viewset for retrieving and updating all user info.
    """

    permission_classes = (AllowAny,)

    def get_queryset(self):
        return User.objects.select_related("profile").all()

    def get_serializer_class(self):
        match self.action:
            case "create" | "me":
                return UserPrivateSerializer
            case "retrieve":
                return UserPublicSerializer
            case "resume":
                return UserResumeSerializer
            case "avatar":
                return UserAvatarSerializer
            case _:
                raise RuntimeError("Unexpected action")

    @action(
        detail=False, methods=["get", "patch"], permission_classes=(IsAuthenticated,)
    )
    def me(self, request):
        """Retrieve or update information about the logged-in user."""
        user = self.get_queryset().get(pk=request.user.pk)
        match request.method.lower():
            case "get":
                serializer = self.get_serializer(user)
                return Response(serializer.data)
            case "patch":
                serializer = self.get_serializer(user, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)

    @action(detail=False, methods=["get", "put"], permission_classes=(IsAuthenticated,))
    def resume(self, request):
        """Retrieve or update the uploaded resume."""
        user = self.get_queryset().get(pk=request.user.pk)
        profile = user.profile
        match request.method.lower():
            case "get":
                if not profile.has_resume:
                    raise Http404
                data = titan.get_object(
                    bucket=settings.GCLOUD_BUCKET_SECURE,
                    name=profile.get_resume_path(),
                    check_safety=True,
                )
                serializer = self.get_serializer(data)
                return Response(serializer.data)

            case "put":
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                resume = serializer.validated_data["resume"]
                with transaction.atomic():
                    profile.has_resume = True
                    profile.save(update_fields=["has_resume"])
                    if settings.GCLOUD_ENABLE_ACTIONS:
                        client = storage.Client(credentials=settings.GCLOUD_CREDENTIALS)
                        blob = client.bucket(settings.GCLOUD_BUCKET_SECURE).blob(
                            profile.get_resume_path()
                        )
                        with blob.open("wb", content_type="application/pdf") as f:
                            for chunk in resume.chunks():
                                f.write(chunk)
                        titan.request_scan(blob)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            case _:
                raise RuntimeError(f"Fallthrough! Was {request.method} implemented?")

    @action(detail=False, methods=["post"], permission_classes=(IsAuthenticated,))
    def avatar(self, request, pk=None):
        """Update uploaded avatar."""
        user = self.get_queryset().get(pk=request.user.pk)
        profile = user.profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        avatar = serializer.validated_data["avatar"]

        img = Image.open(avatar)
        img.thumbnail(settings.USER_MAX_AVATAR_SIZE)

        # Prepare image bytes for upload to Google Cloud
        # See https://stackoverflow.com/a/71094317
        bytestream = io.BytesIO()
        img.save(bytestream, format="png")
        img_bytes = bytestream.getvalue()

        with transaction.atomic():
            profile.has_avatar = True
            profile.avatar_uuid = uuid.uuid4()
            profile.save(update_fields=["has_avatar", "avatar_uuid"])
            if settings.GCLOUD_ENABLE_ACTIONS:
                client = storage.Client()
                blob = client.bucket(settings.GCLOUD_BUCKET_PUBLIC).blob(
                    profile.get_avatar_path()
                )
                blob.upload_from_string(img_bytes)

        return Response(None, status=status.HTTP_204_NO_CONTENT)
