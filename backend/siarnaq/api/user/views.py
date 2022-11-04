import google.cloud.storage as storage
from django.conf import settings
from django.db import transaction
from django.http import FileResponse, Http404
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from siarnaq.api.user.models import UserProfile
from siarnaq.api.user.permissions import IsAuthenticatedAsRequestedUser
from siarnaq.api.user.serializers import (
    PublicUserProfileSerializer,
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
    """

    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticatedAsRequestedUser,)

    def get_queryset(self):
        return UserProfile.objects.select_related("user").all()

    @action(detail=True, methods=["get", "put"], serializer_class=UserResumeSerializer)
    def resume(self, request, pk=None):
        """Retrieve or update the uploaded resume."""
        profile = self.get_object()
        client = storage.Client()
        blob = client.bucket(settings.GCLOUD_SECURED_BUCKET).blob(
            profile.get_resume_path()
        )
        match request.method.lower():
            case "get":
                if not profile.has_resume:
                    raise Http404
                return FileResponse(blob.open("rb"), filename="resume.pdf")
            case "put":
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                resume = serializer.validated_data["resume"]
                with transaction.atomic():
                    profile.has_resume = True
                    profile.save(update_fields=["has_resume"])
                    if not settings.GCLOUD_DISABLE_ALL_ACTIONS:
                        with blob.open("wb") as f:
                            for chunk in resume.chunks():
                                f.write(chunk)
                    blob.metadata = {"Content-Type": "application/pdf"}
                    blob.patch()
                return Response(serializer.data)
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
