from rest_framework import mixins, permissions, viewsets

from siarnaq.api.teams.models import TeamProfile
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
        return TeamProfile.objects.all()
