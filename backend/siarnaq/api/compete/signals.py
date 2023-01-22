from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    SaturnStatus,
    ScrimmageRequest,
)


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
    instance.request_rating_update()


@receiver(post_save, sender=ScrimmageRequest)
def auto_accept_scrimmage(instance, created, **kwargs):
    """Automatically accept a scrimmage request if the team prefers to do so."""
    if not created:
        return
    # if (instance.is_ranked and instance.requested_to.profile.auto_accept_ranked) or (
    #     not instance.is_ranked and instance.requested_to.profile.auto_accept_unranked
    # ):
    # NOTE: we disable auto-accept for ranked scrimmages for now.
    # Is a hotfix patch, can figure out better solution later.
    if not instance.is_ranked and instance.requested_to.profile.auto_accept_unranked:
        # Must wait for transaction to complete, so that maps are inserted.
        transaction.on_commit(
            lambda: ScrimmageRequest.objects.filter(pk=instance.pk).accept()
        )


@receiver(pre_save, sender=Match)
def report_to_bracket(instance: Match, update_fields, **kwargs):
    """
    If a match is associated with a tournament bracket,
    update that tournament bracket.
    """

    # Note that if a match is already finalized, and Saturn tries to report it again,
    # the match will not save, and this signal is never run.
    # Still, we include other checks to eliminate redundant
    # calls to our bracket service, especially to conserve API usage limits.

    if update_fields is not None and "status" not in update_fields:
        return

    if instance.status != SaturnStatus.COMPLETED or instance.tournament_round is None:
        return

    instance.report_to_bracket(is_private=True)
