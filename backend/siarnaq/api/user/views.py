import google.cloud.storage as storage
from django.db import transaction
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

import siarnaq.gcloud as gcloud
from siarnaq.api.user.models import UserProfile
from siarnaq.api.user.permissions import IsAuthenticatedAsRequestedUser
from siarnaq.api.user.serializers import (
    PublicUserProfileSerializer,
    UserProfileSerializer,
    UserResumeSerializer,
)
from siarnaq.gcloud import titan


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
                try:
                    f = titan.get_object_if_safe(
                        gcloud.secure_bucket, profile.get_resume_path()
                    )
                except titan.RequestRefused as e:
                    return Response(e.reason, status.HTTP_404_NOT_FOUND)
                return FileResponse(f, filename="resume.pdf")

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
                        with blob.open("wb", content_type="application/pdf") as f:
                            for chunk in resume.chunks():
                                f.write(chunk)
                        titan.request_scan(blob)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            case _:
                raise RuntimeError(f"Fallthrough! Was {request.method} implemented?")


class PublicUserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving public user info.
    """

    serializer_class = PublicUserProfileSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return UserProfile.objects.all()
