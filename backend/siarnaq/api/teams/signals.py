from django.db.models.signals import post_save
from django.dispatch import receiver

from siarnaq.api.compete.models import MatchParticipant


@receiver(post_save, sender=MatchParticipant)
def copy_rating_to_profile(instance, **kwargs):
    if instance.rating is not None:
        profile = instance.team.profile
        if instance.rating.n > profile.rating.n:
            profile.rating = instance.rating
            profile.save()
