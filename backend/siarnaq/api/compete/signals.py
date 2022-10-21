from django.core.exceptions import ObjectDoesNotExist
from django.db.models.signals import post_save
from django.dispatch import receiver

from siarnaq.api.compete.models import MatchParticipant


@receiver(post_save, sender=MatchParticipant)
def connect_linked_list(instance, created, **kwargs):
    """Push newly created participations to the list of participations for that team."""
    if not created:
        return
    instance.previous_participation = (
        MatchParticipant.objects.filter(team=instance.team, pk__lt=instance.pk)
        .order_by("-pk")
        .first()
    )
    instance.save()


@receiver(post_save, sender=MatchParticipant)
def try_finalize_another_rating(instance, **kwargs):
    """Update the ratings for the teams involved when a match is finalized."""
    if instance.rating is not None:
        # Finalize next in linked list
        try:
            instance.next_participation.try_finalize_rating()
        except ObjectDoesNotExist:
            pass  # No more participations to do
