from django.apps import apps
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions

from siarnaq.api.episodes.models import Episode, Tournament


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


class IsEpisodeMutableForTeam(permissions.BasePermission):
    """
    Allows mutation access to visible episodes iff the user is on a team that is not
    currently frozen for a tournament with an active submission freeze window.
    Episodes that are not visible will raise a 404.
    """

    def has_permission(self, request, view):
        episode = get_object_or_404(
            Episode.objects.visible_to_user(is_staff=request.user.is_staff),
            pk=view.kwargs["episode_id"],
        )
        # Allow safe methods (GET/HEAD/OPTIONS) without further checks.
        if request.method in permissions.SAFE_METHODS:
            return True

        # For mutating requests, require an authenticated user.
        if not request.user or not request.user.is_authenticated:
            return False

        # Find teams in this episode that the user belongs to.
        Team = apps.get_model("teams", "Team")
        team = Team.objects.filter(episode=episode, members=request.user)

        # If the user is not on any team in this episode, deny mutation.
        if not team.exists():
            return False

        # Deny mutation if any of the user's teams are eligible for a tournament
        # that currently has an active submission freeze window.
        now = timezone.now()
        active_freeze_tournaments = Tournament.objects.filter(
            episode=episode,
            submission_freeze__lte=now,
            submission_unfreeze__gt=now,
            is_public=True,
        )

        for tournament in active_freeze_tournaments:
            if team.filter_eligible(tournament).exists():
                return False

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
