from django.db.models.signals import post_save
from django.dispatch import receiver

from siarnaq.api.compete.models import MatchParticipant
from siarnaq.api.teams.models import TeamProfile


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
