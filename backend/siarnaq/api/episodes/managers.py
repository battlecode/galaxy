from django.db import models
from django.utils import timezone


class EpisodeQuerySet(models.QuerySet):
    def visible_to_user(self, *, is_staff):
        """Filter the queryset for only episodes that are visible to the user."""
        if is_staff:
            # Staff can see everything
            return self.all()
        else:
            # Other users can only see those that have been released
            return self.filter(registration__lte=timezone.now())


class TournamentQuerySet(models.QuerySet):
    def visible_to_user(self, *, is_staff):
        """
        Filter the queryset for only tournaments that are visible to the user. Does not
        consider episode visibility.
        """
        if is_staff:
            # Staff can see everything
            return self.all()
        else:
            # Other users can only see those that have been released
            return self.filter(is_public=True)
