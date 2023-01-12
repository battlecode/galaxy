from rest_framework import permissions

from siarnaq.api.teams.models import Team


class HasTeamSubmission(permissions.BasePermission):
    """Allows access to users whose team has a submission in the current episode."""

    def has_permission(self, request, view):
        return (
            Team.objects.filter(episode=view.kwargs["episode_id"], members=request.user)
            .with_active_submission()
            .exists()
        )
