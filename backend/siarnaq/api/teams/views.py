from rest_framework import permissions, status, mixins, viewsets, filters
from siarnaq.api.teams.models import TeamStatus
from siarnaq.api.teams.serializers import TeamSerializer
# Create your views here.

class TeamViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Team.objects.filter(episode_id=self.request.episode, team_status=TeamStatus.REGULAR).all()
    
    def create(self, request):
        