import google.cloud.storage as storage
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.http import FileResponse
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.compete.models import Match, Submission
from siarnaq.api.compete.permissions import IsAdminUserOrEpisodeAvailable, IsOnTeam
from siarnaq.api.compete.serializers import (
    MatchSerializer,
    SubmissionReportSerializer,
    SubmissionSerializer,
)
from siarnaq.api.teams.models import Team


class EpisodeContextMixin:
    """Add the current episode, team and user to the serializer context."""

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            episode_id=self.kwargs["episode_id"],
            user_id=self.request.user.pk,
            team_id=None,
            is_staff=self.request.user.is_staff,
        )
        if self.request.user.is_authenticated:
            try:
                context.update(
                    team_id=Team.objects.get(
                        episode=self.kwargs["episode_id"],
                        members=self.request.user,
                    ).pk
                )
            except Team.DoesNotExist:
                pass  # User is not on a team
        return context


class SubmissionViewSet(
    EpisodeContextMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    A viewset for creating and retrieving Submissions.
    """

    serializer_class = SubmissionSerializer
    permission_classes = (IsAuthenticated, IsAdminUserOrEpisodeAvailable, IsOnTeam)

    def get_queryset(self):
        queryset = Submission.objects.filter(
            episode=self.kwargs["episode_id"]
        ).select_related("team", "user")
        if self.action != "report":
            queryset = queryset.filter(team__members=self.request.user)
        return queryset

    def create(self, request, *, episode_id):
        """
        Create a new submission. This operation creates a submission record in the
        database, saves the source code to the storage bucket on Google cloud, and
        enqueues the submission for compilation on Saturn.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        source_code = serializer.validated_data["source_code"]

        with transaction.atomic():
            instance = serializer.save()
            if not settings.GCLOUD_DISABLE_ALL_ACTIONS:
                # Upload file to storage
                client = storage.Client()
                blob = client.bucket(settings.GCLOUD_SECURED_BUCKET).blob(
                    instance.get_source_path()
                )
                with blob.open("wb") as f:
                    for chunk in source_code.chunks():
                        f.write(chunk)
            # Send to Saturn
            Submission.objects.filter(pk=instance.pk).enqueue()

        # Generate the Location header, as supplied by CreateModelMixin
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @extend_schema(
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Successfully retrieved the requested file"
            )
        }
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None, *, episode_id):
        """Download the source code associated with a submission."""
        submission = self.get_object()
        client = storage.Client()
        blob = client.bucket(settings.GCLOUD_SECURED_BUCKET).blob(
            submission.get_source_path()
        )
        return FileResponse(
            blob.open("rb"),
            as_attachment=True,
            filename="submission.zip",
        )

    @extend_schema(
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Report has been received"
            )
        }
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=SubmissionReportSerializer,
    )
    def report(self, request, pk=None, *, episode_id):
        """
        Report the outcome of this submission on Saturn. Reports on already-finalized
        invocations are silently ignored.
        """
        instance = self.get_object()
        if not instance.is_finalized():
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class MatchViewSet(
    EpisodeContextMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """
    A viewset for viewing and retrieving Matches.
    """

    serializer_class = MatchSerializer
    permission_classes = (IsAdminUserOrEpisodeAvailable,)

    def get_queryset(self):
        return (
            Match.objects.filter(episode=self.kwargs["episode_id"])
            .select_related(
                "red__previous_participation__rating",
                "blue__previous_participation__rating",
                "red__rating",
                "blue__rating",
                "tournament_round",
            )
            .prefetch_related("red__team__members", "blue__team__members", "maps")
        )

    @extend_schema(responses={status.HTTP_200_OK: MatchSerializer(many=True)})
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsAuthenticated, IsAdminUserOrEpisodeAvailable, IsOnTeam),
    )
    def my(self, request, *, episode_id):
        """List all scrimmages that the authenticated team participated in."""
        # It is extremely important that this method does not return any matches in
        # unreleased tournaments, to not expose results prematurely. On top of this, it
        # is a design choice not to return any tournament matches at all, because it
        # seems logical that they are not part of a scrimmage listing.
        queryset = self.get_queryset().filter(
            Q(red__team__members=request.user) | Q(blue__team__members=request.user),
            tournament_round__isnull=True,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
