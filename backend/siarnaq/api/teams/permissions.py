from rest_framework import permissions

from siarnaq.api.teams.models import Team


class IsOnTeam(permissions.BasePermission):
    """Allows access to users who have a team in the current episode."""

    def has_permission(self, request, view):
        return Team.objects.filter(
            episode=view.kwargs["episode_id"], members=request.user
        ).exists()
