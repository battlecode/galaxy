from django.shortcuts import get_object_or_404
from rest_framework import permissions

from siarnaq.api.compete.models import ScrimmageRequestStatus
from siarnaq.api.episodes.models import Episode
from siarnaq.api.teams.models import Team


class IsEpisodeAvailable(permissions.BasePermission):
    """
    Allows readonly access to visible episodes, and restricts mutation if configured to
    check for frozen episodes. Episodes that are not visible will raise a 404.
    """

    def __init__(self, *, allow_frozen=False):
        """
        Initializes the permission.

        Parameters
        ----------
        allow_frozen : bool
            Whether to allow mutation to frozen episodes.
        """
        self._allow_frozen = allow_frozen

    def has_permission(self, request, view):
        episode = get_object_or_404(
            Episode.objects.visible_to_user(is_staff=request.user.is_staff),
            pk=view.kwargs["episode_id"],
        )
        return request.method in permissions.SAFE_METHODS or (
            self._allow_frozen or not episode.frozen()
        )


class IsOnTeam(permissions.BasePermission):
    """Allows access to users who have a team in the current episode."""

    def has_permission(self, request, view):
        return Team.objects.filter(
            episode=view.kwargs["episode_id"], members=request.user
        ).exists()


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
