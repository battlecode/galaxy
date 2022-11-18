import io

import google.cloud.storage as storage
from django.db import transaction
from django.db.models import Q
from django.http import FileResponse
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

import siarnaq.gcloud as gcloud
from siarnaq.api.compete.models import (
    Match,
    ScrimmageRequest,
    ScrimmageRequestStatus,
    Submission,
)
from siarnaq.api.compete.permissions import HasTeamSubmission, IsScrimmageRequestActor
from siarnaq.api.compete.serializers import (
    MatchReportSerializer,
    MatchSerializer,
    ScrimmageRequestSerializer,
    SubmissionReportSerializer,
    SubmissionSerializer,
)
from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.teams.models import Team
from siarnaq.api.teams.permissions import IsOnTeam


class EpisodeTeamUserContextMixin:
    """Add the current episode, team and user to the serializer context."""

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            episode_id=self.kwargs["episode_id"],
            user_id=self.request.user.pk,
            team_id=None,
            user_is_staff=self.request.user.is_staff,
        )
        if self.request.user.is_authenticated:
            try:
                team = Team.objects.get(
                    episode=self.kwargs["episode_id"],
                    members=self.request.user,
                )
            except Team.DoesNotExist:
                pass  # User is not on a team
            else:
                context.update(
                    team_id=team.pk,
                    team_is_staff=team.is_staff(),
                )
        return context


class SubmissionViewSet(
    EpisodeTeamUserContextMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    A viewset for creating and retrieving Submissions.
    """

    serializer_class = SubmissionSerializer
    permission_classes = (
        IsAuthenticated,
        IsEpisodeAvailable | IsAdminUser,
        IsOnTeam,
    )

    def get_queryset(self):
        queryset = (
            Submission.objects.filter(episode=self.kwargs["episode_id"])
            .select_related("team", "user")
            .order_by("-pk")
        )
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
            if gcloud.enable_actions:
                # Upload file to storage
                client = storage.Client(credentials=gcloud.credentials)
                blob = client.bucket(gcloud.secure_bucket).blob(
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
        if gcloud.enable_actions:
            client = storage.Client(credentials=gcloud.credentials)
            blob = (
                client.bucket(gcloud.secure_bucket)
                .blob(submission.get_source_path())
                .open("rb")
            )
        else:
            blob = io.BytesIO()
        return FileResponse(
            blob,
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
    EpisodeTeamUserContextMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """
    A viewset for viewing and retrieving Matches.
    """

    serializer_class = MatchSerializer
    permission_classes = (IsEpisodeAvailable | IsAdminUser,)

    def get_queryset(self):
        return (
            Match.objects.filter(episode=self.kwargs["episode_id"])
            .select_related(
                "red__previous_participation__rating",
                "blue__previous_participation__rating",
                "red__rating",
                "blue__rating",
                "red__team__profile__rating",
                "blue__team__profile__rating",
                "tournament_round",
            )
            .prefetch_related("red__team__members", "blue__team__members", "maps")
            .order_by("-pk")
        )

    @extend_schema(responses={status.HTTP_200_OK: MatchSerializer(many=True)})
    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsAuthenticated, IsEpisodeAvailable, IsOnTeam),
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
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

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
        serializer_class=MatchReportSerializer,
    )
    def report(self, request, pk=None, *, episode_id):
        """
        Report the outcome of this match on Saturn. Reports on already-finalized
        invocations are silently ignored.
        """
        instance = self.get_object()
        if not instance.is_finalized():
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class ScrimmageRequestViewSet(
    EpisodeTeamUserContextMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    A viewset for creating and responding to Scrimmage Requests.
    """

    serializer_class = ScrimmageRequestSerializer

    def get_queryset(self):
        queryset = (
            ScrimmageRequest.objects.filter(
                Q(requested_to__members=self.request.user)
                | Q(requested_by__members=self.request.user),
                episode=self.kwargs["episode_id"],
            )
            .select_related(
                "requested_to__profile__rating", "requested_by__profile__rating"
            )
            .prefetch_related("requested_to__members", "requested_by__members", "maps")
            .order_by("-pk")
        )
        if self.action in ("accept", "reject", "destroy"):
            # Mutator operations require locks to prevent races
            queryset = queryset.select_for_update(of=("self"))
        return queryset

    def get_permissions(self):
        permissions = [IsAuthenticated()]
        match self.action:
            case "create":
                # Episode must not be frozen in order to create new requests
                permissions.append((IsEpisodeAvailable | IsAdminUser)())
                permissions.append(HasTeamSubmission())
            case "accept":
                # Episode must not be frozen in order to allow new matches
                permissions.append((IsEpisodeAvailable | IsAdminUser)())
                permissions.append(IsScrimmageRequestActor("requested_to"))
                permissions.append(HasTeamSubmission())
            case "reject" | "destroy":
                # Episode can be frozen, but use permission to ensure episode visible
                # AllowAny will allow all access, and we just use the permission to
                # raise a 404 if the user shouldn't know that the episode exists
                permissions.append(IsEpisodeAvailable(allow_frozen=True))
                permissions.append(IsScrimmageRequestActor("requested_by"))
            case _:
                permissions.append((IsEpisodeAvailable | IsAdminUser)())
                permissions.append(IsOnTeam())
        return permissions

    def create(self, request, *, episode_id):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Generate the Location header, as supplied by CreateModelMixin
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @extend_schema(
        responses={status.HTTP_200_OK: ScrimmageRequestSerializer(many=True)}
    )
    @action(detail=False, methods=["get"])
    def inbox(self, request, *, episode_id):
        """Get all pending scrimmage requests received."""
        queryset = self.get_queryset().filter(
            Q(requested_to__members=request.user),
            status=ScrimmageRequestStatus.PENDING,
        )
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(
        responses={status.HTTP_200_OK: ScrimmageRequestSerializer(many=True)}
    )
    @action(detail=False, methods=["get"])
    def outbox(self, request, *, episode_id):
        """Get all pending scrimmage requests sent."""
        queryset = self.get_queryset().filter(
            Q(requested_by__members=request.user),
            status=ScrimmageRequestStatus.PENDING,
        )
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(
        request=None,
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Scrimmage request has been accepted"
            )
        },
    )
    @action(detail=True, methods=["post"])
    @transaction.atomic
    def accept(self, request, pk=None, *, episode_id):
        """Accept a scrimmage request."""
        self.get_object()  # Asserts permission
        self.get_queryset().filter(pk=pk).accept()
        return Response(None, status.HTTP_204_NO_CONTENT)

    @extend_schema(
        request=None,
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Scrimmage request has been rejected"
            )
        },
    )
    @action(detail=True, methods=["post"])
    @transaction.atomic
    def reject(self, request, pk=None, *, episode_id):
        """Reject a scrimmage request."""
        self.get_object()  # Asserts permission
        self.get_queryset().filter(pk=pk).reject()
        return Response(None, status.HTTP_204_NO_CONTENT)

    @transaction.atomic
    def destroy(self, request, pk=None, *, episode_id):
        """Cancel a scrimmage request."""
        return super().destroy(request, pk=pk, episode_id=episode_id)
