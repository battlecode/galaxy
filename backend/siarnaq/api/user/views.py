import uuid

import google.cloud.storage as storage
import structlog
from django.conf import settings
from django.db import transaction
from django.http import Http404
from django_email_verification import send_email
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

    def create(self, request, *args, **kwargs):
        """Create a new user (registration) and send verification email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        user.is_active = True
        user.email_verified = False
        user.save()

        logger.info("user_created", user_id=user.id, username=user.username)
        send_email(user)
        logger.info("verification_email_sent", user_id=user.id, email=user.email)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def _handle_email_change(self, user, old_email):
        """
        Check if the user's email has changed. If so, reset verification status,
        send a new verification email, and log.
        """
        if user.email != old_email:
            user.email_verified = False
            user.save(update_fields=["email_verified"])
            send_email(user)
            logger.info(
                "email_changed",
                user_id=user.id,
                old_email=old_email,
                new_email=user.email,
            )

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
                old_email = user.email
                serializer = self.get_serializer(user, data=request.data)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                self._handle_email_change(user, old_email)
                return Response(serializer.data)
            case "patch":
                old_email = user.email
                serializer = self.get_serializer(user, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                self._handle_email_change(user, old_email)
                return Response(serializer.data)

    @extend_schema(
        responses={
            status.HTTP_200_OK: {
                "type": "object",
                "additionalProperties": {"$ref": "#/components/schemas/TeamPublic"},
            }
        }
    )
    @action(
        detail=True,
        permission_classes=(AllowAny,),
        serializer_class=TeamPublicSerializer,
    )
    def teams(self, request, pk=None):
        """Retrieve all teams associated with a user."""
        teams = Team.objects.filter(members__pk=pk)
        serializer = self.get_serializer(teams, many=True)
        # Return dict - {"episode": Team}
        teams_dict = {team["episode"]: team for team in serializer.data}
        return Response(teams_dict)

    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "resume": {"type": "string", "format": "binary"},
                },
            }
        },
    )
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

    @extend_schema(
        responses={status.HTTP_204_NO_CONTENT: None},
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "avatar": {"type": "string", "format": "binary"},
                },
            }
        },
    )
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

    @extend_schema(
        request=None,
        responses={
            status.HTTP_204_NO_CONTENT: None,
            status.HTTP_400_BAD_REQUEST: None,
        },
    )
    @action(
        detail=False,
        methods=["post"],
        permission_classes=(IsAuthenticated,),
    )
    def resend_verification_email(self, request):
        """Resend verification email to authenticated user."""
        user = self.get_queryset().get(pk=request.user.pk)

        if user.email_verified:
            logger.info(
                "resend_verification_attempted_already_verified",
                user_id=user.id,
                email=user.email,
            )
            return Response(
                None,
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_email(user)
        logger.info("verification_email_resent", user_id=user.id, email=user.email)

        return Response(None, status=status.HTTP_204_NO_CONTENT)
