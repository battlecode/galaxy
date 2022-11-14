from rest_framework import permissions

from siarnaq.api.compete.models import ScrimmageRequestStatus
from siarnaq.api.teams.models import Team


class HasTeamSubmission(permissions.BasePermission):
    """Allows access to users whose team has a submission in the current episode."""

    def has_permission(self, request, view):
        return (
            Team.objects.filter(episode=view.kwargs["episode_id"], members=request.user)
            .with_active_submission()
            .exists()
        )


class IsScrimmageRequestActor(permissions.BasePermission):
    """Allows access to users of one team in a scrimmage request if it is pending."""

    def __init__(self, side):
        """
        Initializes the permission.

        Parameters
        ----------
        side : str
            The side of the scrimmage request being granted access. Should be one of
            "requested_to" or "requested_by".
        """
        self._side = side

    def has_object_permission(self, request, view, obj):
        return obj.status == ScrimmageRequestStatus.PENDING and any(
            member.pk == request.user.pk
            for member in getattr(obj, self._side).members.all()
        )
