from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from siarnaq.api.episodes.permissions import IsEpisodeAvailable
from siarnaq.api.teams.models import TeamProfile
from siarnaq.api.teams.permissions import IsOnRequestedTeam
from siarnaq.api.teams.serializers import TeamProfileSerializer


class TeamViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
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
        return TeamProfile.objects.all()  # TODO: any select related's to use here?

    def get_permissions(self):
        return [
            IsAuthenticated(),
            IsEpisodeAvailable(allow_frozen=True),
            IsOnRequestedTeam(),
        ]

    def get_object(self):
        """
        If provided ID is "current", set object to logged in user's team.
        See https://stackoverflow.com/a/36626403.
        """
        pk = self.kwargs.get("pk")

        if pk == "current":
            # TODO: enforce a uniqueness constraint,
            # below queryset should never have >1 teams
            return get_object_or_404(
                self.get_queryset().filter(team__members__id=self.request.user.pk)
            )

    # TODO: this should not need/accept team data, it doesn't need any
    @action(detail=True, methods=["patch"])
    def leave(self, request, **kwargs):
        """Leave a team."""
        team_profile = self.get_object()
        team = team_profile.team

        team.members.remove(request.user.id)
        if team.members.count() == 0:
            pass  # TODO: delete / pseudo delete team?
        team.save()

        serializer = self.get_serializer(team_profile)
        return Response(serializer.data, status.HTTP_200_OK)
