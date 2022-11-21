from rest_framework import permissions

from siarnaq.api.teams.models import Team


class IsOnTeam(permissions.BasePermission):
    """Allows access to users who have a team in the current episode."""

    def has_permission(self, request, view):
        return Team.objects.filter(
            episode=view.kwargs["episode_id"], members=request.user
        ).exists()


class IsOnRequestedTeam(permissions.BasePermission):
    message = "Must be authenticated as the requested team."

    def has_object_permission(self, request, _, obj):
        return request.user in obj.team.members.all()
