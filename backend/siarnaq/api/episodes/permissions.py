from django.shortcuts import get_object_or_404
from rest_framework import permissions

from siarnaq.api.episodes.models import Episode


class IsEpisodeAvailable(permissions.BasePermission):
    """
    Allows access to visible episodes. Episodes that are not visible will raise a 404.
    """

    def has_permission(self, request, view):
        get_object_or_404(
            Episode.objects.visible_to_user(is_staff=request.user.is_staff),
            pk=view.kwargs["episode_id"],
        )
        return True


class IsEpisodeMutable(permissions.BasePermission):
    """
    Allows mutation access to visible episodes iff it is not frozen. Episodes that are
    not visible will raise a 404.
    """

    def has_permission(self, request, view):
        episode = get_object_or_404(
            Episode.objects.visible_to_user(is_staff=request.user.is_staff),
            pk=view.kwargs["episode_id"],
        )
        return request.method in permissions.SAFE_METHODS or not episode.frozen()
