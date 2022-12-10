import uuid

import google.cloud.storage as storage
import structlog
from django.conf import settings
from django.db import transaction
from django.http import Http404
from drf_spectacular.utils import extend_schema
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.teams.models import Team
from siarnaq.api.teams.serializers import TeamPublicSerializer
from siarnaq.api.user.models import User
from siarnaq.api.user.serializers import (
    UserAvatarSerializer,
    UserCreateSerializer,
    UserPrivateSerializer,
    UserPublicSerializer,
    UserResumeSerializer,
)
from siarnaq.gcloud import titan

logger = structlog.get_logger(__name__)


class UserViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
):
    """
    A viewset for retrieving and updating all user info.
    """

    permission_classes = (AllowAny,)
    filter_backends = [filters.SearchFilter]
    search_fields = ["username"]

    def get_queryset(self):
        return User.objects.select_related("profile").all()

    def get_serializer_class(self):
        match self.action:
            case "create":
                return UserCreateSerializer
            case "retrieve":
                return UserPublicSerializer
            case _:
                return super().get_serializer_class()

    @action(
        detail=False,
        methods=["get", "put", "patch"],
        permission_classes=(IsAuthenticated,),
        serializer_class=UserPrivateSerializer,
    )
    def me(self, request):
        """Retrieve or update information about the logged-in user."""
        user = self.get_queryset().get(pk=request.user.pk)
        match request.method.lower():
            case "get":
                serializer = self.get_serializer(user)
                return Response(serializer.data)
            case "put":
                serializer = self.get_serializer(user, data=request.data)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
            case "patch":
                serializer = self.get_serializer(user, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)

    @action(
        detail=False,
        methods=["get", "put"],
        permission_classes=(IsAuthenticated,),
        serializer_class=UserResumeSerializer,
    )
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
                    if not settings.GCLOUD_ENABLE_ACTIONS:
                        logger.warn(
                            "resume_disabled", message="Resume uploads are disabled."
                        )
                    else:
                        logger.info("resume_upload", message="Uploading resume.")
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

    @extend_schema(responses={status.HTTP_204_NO_CONTENT: None})
    @action(
        detail=False,
        methods=["post"],
        permission_classes=(IsAuthenticated,),
        serializer_class=UserAvatarSerializer,
    )
    def avatar(self, request, pk=None):
        """Update uploaded avatar."""
        user = self.get_queryset().get(pk=request.user.pk)
        profile = user.profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        avatar = serializer.validated_data["avatar"]

        with transaction.atomic():
            profile.has_avatar = True
            profile.avatar_uuid = uuid.uuid4()
            profile.save(update_fields=["has_avatar", "avatar_uuid"])
            titan.upload_image(avatar, profile.get_avatar_path())

        return Response(None, status=status.HTTP_204_NO_CONTENT)


class TeamByUserViewSet(
    viewsets.GenericViewSet,
):
    """
    A viewset for retrieving a user's associated teams.
    """

    permission_classes = (AllowAny,)
    filter_backends = [filters.SearchFilter]

    def get_queryset(self):
        return Team.objects.all()

    @action(
        detail=False,
        permission_classes=(IsAuthenticated,),
        serializer_class=TeamPublicSerializer,
    )
    def teams(self, request, **kwargs):
        """Retrieve all teams associated with a user."""
        user_id = self.kwargs["id"]
        teams = self.get_queryset().all().filter(members__pk=user_id)
        serializer = self.get_serializer(teams, many=True)
        # Return dict - {"episode": Team}
        teams_dict = {team["episode"]: team for team in serializer.data}
        return Response(teams_dict)
