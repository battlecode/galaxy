from django.shortcuts import get_object_or_404
from rest_framework import permissions

from siarnaq.api.episodes.models import Episode


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
