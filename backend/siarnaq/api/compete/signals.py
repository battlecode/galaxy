from django.db.models.signals import post_save
from django.dispatch import receiver

from siarnaq.api.compete.models import Match, MatchParticipant


@receiver(post_save, sender=MatchParticipant)
def connect_linked_list(instance, created, **kwargs):
    """Push newly created participations to the list of participations for that team."""
    if not created:
        return

    instance.previous_participation_id = (
        MatchParticipant.objects.filter(team=instance.team, pk__lt=instance.pk)
        .order_by("-pk")
        .values_list("pk", flat=True)
        .first()
    )
    instance.save(update_fields=["previous_participation"])


@receiver(post_save, sender=Match)
def update_match_ratings(instance, **kwargs):
    """Try to finalize ratings for participations whenever a match is updated."""
    instance.try_finalize_ratings()
