from rest_framework import filters, mixins, permissions, status, viewsets

from siarnaq.api.teams.models import TeamProfile, TeamStatus
from siarnaq.api.teams.serializers import TeamProfileSerializer


class TeamViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
):
    serializer_class = TeamProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # return Team.objects.filter(episode_id=self.request.episode, team_status=TeamStatus.REGULAR).all()
        return TeamProfile.objects.all()
