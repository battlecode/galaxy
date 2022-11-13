from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.teams.models import TeamProfile
from siarnaq.api.teams.permissions import IsOnRequestedTeam, IsOnTeam
from siarnaq.api.teams.serializers import TeamJoinSerializer, TeamProfileSerializer


class TeamViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
):
    """
    A viewset for retrieving and updating all team/team profile info.

    When creating a team, add the logged in user as the sole member.

    When "current" is provided for the ID, retrieve/update info for
    the logged in user's team.
    """

    serializer_class = TeamProfileSerializer

    def get_queryset(self):
        return TeamProfile.objects.select_related(
            "team",
            "team__members",
            "rating",
        )

    def get_permissions(self):
        permissions = [
            IsAuthenticated(),
            IsEpisodeAvailable(allow_frozen=True),
            IsOnRequestedTeam(),
        ]
        if self.action == "create" or self.action == "join":
            # Must not be on more than one team
            permissions.append((~IsOnTeam)())

        return permissions

    def get_current_object(self):
        return get_object_or_404(
            self.get_queryset().filter(team__members__id=self.request.user.pk)
        )

    def get_object(self):
        """
        If provided ID is "current", set object to logged in user's team.
        See https://stackoverflow.com/a/36626403.
        """
        pk = self.kwargs.get("pk")

        if pk == "current":
            return self.get_current_object()

        return super().get_object()

    @extend_schema(request=None)
    @action(detail=False, methods=["post"])
    def leave(self, request, **kwargs):
        """Leave a team."""
        team_profile = self.get_current_object()
        team = team_profile.team

        team.members.remove(request.user.id)
        team.save()

        serializer = self.get_serializer(team_profile)
        return Response(serializer.data, status.HTTP_200_OK)

    @extend_schema(responses={status.HTTP_200_OK: TeamProfileSerializer})
    @action(detail=False, methods=["post"], serializer_class=TeamJoinSerializer)
    def join(self, request, **kwargs):
        team_profile = get_object_or_404(
            self.get_queryset().filter(
                team__join_key=self.request.data["join_key"],
                team__name=self.request.data["name"],
                team__episode=self.kwargs["episode_id"],
            )
        )
        team = team_profile.team

        team.members.add(request.user)
        team.save()

        serializer = TeamProfileSerializer(team_profile)
        return Response(serializer.data, status.HTTP_200_OK)
