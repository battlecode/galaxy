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


class IsScrimmageRequestSender(permissions.BasePermission):
    """Allows access to users of a pending scrimmage request's sender."""

    def has_object_permission(self, request, view, obj):
        return obj.status == ScrimmageRequestStatus.PENDING and any(
            member.pk == request.user.pk for member in obj.requested_by.members.all()
        )


class IsScrimmageRequestRecipient(permissions.BasePermission):
    """Allows access to users of a pending scrimmage request's recipient."""

    def has_object_permission(self, request, view, obj):
        return obj.status == ScrimmageRequestStatus.PENDING and any(
            member.pk == request.user.pk for member in obj.requested_to.members.all()
        )
