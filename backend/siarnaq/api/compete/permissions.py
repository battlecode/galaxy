from django.shortcuts import get_object_or_404
from rest_framework import permissions

from siarnaq.api.episodes.models import Episode
from siarnaq.api.teams.models import Team


class IsAdminUserOrEpisodeAvailable(permissions.BasePermission):
    """
    Allows readonly access to visible episodes, and mutation only if the episode is not
    frozen. Episodes that are not visible will raise a 404.
    """

    def has_permission(self, request, view):
        episode = get_object_or_404(
            Episode.objects.user_visible(is_staff=request.user.is_staff),
            pk=view.kwargs["episode_id"],
        )
        return (
            request.user.is_staff
            or request.method in permissions.SAFE_METHODS
            or not episode.frozen()
        )


class IsOnTeam(permissions.BasePermission):
    """Allows access to users who have a team in the current episode."""

    def has_permission(self, request, view):
        return Team.objects.filter(
            episode=view.kwargs["episode_id"], members=request.user
        ).exists()
