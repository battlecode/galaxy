from rest_framework import mixins, permissions, viewsets
from rest_framework.permissions import IsAdminUser

from siarnaq.api.episodes.permissions import IsEpisodeAvailableForRegistration
from siarnaq.api.teams.models import TeamProfile
from siarnaq.api.teams.permissions import IsOnTeam
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
    """

    serializer_class = TeamProfileSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsEpisodeAvailableForRegistration | IsAdminUser,
        IsOnTeam,
    ]

    def get_queryset(self):
        return TeamProfile.objects.all()
