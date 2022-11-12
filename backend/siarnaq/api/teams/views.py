from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

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
            # TODO: change to get once unique constraint enforced
            #            return get_object_or_404(
            return (
                self.get_queryset()
                .filter(team__members__id=self.request.user.pk)
                .first()
            )
        #            )

        return super().get_object()
