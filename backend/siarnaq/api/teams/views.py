from rest_framework import permissions, status, mixins, viewsets, filters
from siarnaq.api.teams.models import (
    TeamStatus,
    TeamProfile
    )
from siarnaq.api.teams.serializers import TeamProfileSerializer

class TeamViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
    serializer_class = TeamProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # return Team.objects.filter(episode_id=self.request.episode, team_status=TeamStatus.REGULAR).all()
        return TeamProfile.objects.all()