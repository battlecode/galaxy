from django.db.models.signals import post_save
from django.dispatch import receiver

from siarnaq.api.compete.models import Match, MatchParticipant, ScrimmageRequest


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
    instance.save(update_fields=["previous_participation"])


@receiver(post_save, sender=Match)
def update_match_ratings(instance, **kwargs):
    """Try to finalize ratings for participations whenever a match is updated."""
    instance.try_finalize_ratings()


@receiver(post_save, sender=ScrimmageRequest)
def auto_accept_scrimmage(instance, created, **kwargs):
    """Automatically accept a scrimmage request if the team prefers to do so."""
    if not created:
        return
    if (instance.is_ranked and instance.requested_to.profile.auto_accept_ranked) or (
        not instance.is_ranked and instance.requested_to.profile.auto_accept_unranked
    ):
        ScrimmageRequest.objects.filter(pk=instance.pk).accept()
