from django.conf import settings
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from rest_framework.exceptions import ValidationError

from siarnaq.api.compete.models import MatchParticipant
from siarnaq.api.teams.models import Team, TeamProfile, TeamStatus


@receiver(post_save, sender=MatchParticipant)
def copy_rating_to_profile(instance, update_fields, **kwargs):
    """
    Ensure that the profile's ratings is up to date whenever a newer match rating is
    reported.
    """
    if update_fields is not None and "rating" not in list(update_fields):
        return  # No new rating
    if instance.rating is not None:
        TeamProfile.objects.filter(
            team=instance.team_id, rating__n__lt=instance.rating.n
        ).update(rating=instance.rating)


@receiver(m2m_changed, sender=Team.members.through)
def make_empty_team_inactive(instance, action, **kwargs):
    if action == "post_remove":
        if instance.members.count() == 0:
            instance.status = TeamStatus.INACTIVE


@receiver(m2m_changed, sender=Team.members.through)
def prevent_team_exceed_capacity(instance, action, **kwargs):
    if action == "pre_add":
        if instance.get_non_staff_count() == settings.TEAMS_MAX_TEAM_SIZE:
            raise ValidationError("Maximum number of team members exceeded.")


@receiver(m2m_changed, sender=Team.members.through)
def prevent_joining_inactive_team(instance, action, **kwargs):
    if action == "pre_add" and instance.status == TeamStatus.INACTIVE:
        raise ValidationError("Cannot join an inactive team.")
