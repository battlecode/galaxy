import json

import google.cloud.scheduler as scheduler
import structlog
from django.conf import settings
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.urls import reverse

from siarnaq.api.compete.models import Match, SaturnStatus
from siarnaq.api.episodes.models import Episode

logger = structlog.get_logger(__name__)


@receiver(pre_save, sender=Episode)
def update_autoscrim_schedule(instance, update_fields, **kwargs):
    """
    Update the Google Cloud Scheduler resource for automatic scrimmage scheduling
    whenever the specification is changed, raising an exception if the operation fails.
    """
    if update_fields is not None and "autoscrim_schedule" not in update_fields:
        return  # No new schedule
    try:
        old_schedule = Episode.objects.values_list("autoscrim_schedule", flat=True).get(
            pk=instance.pk
        )
    except Episode.DoesNotExist:
        old_schedule = None
    new_schedule = instance.autoscrim_schedule

    log = logger.bind(
        pk=instance.pk, old_schedule=old_schedule, new_schedule=new_schedule
    )
    if old_schedule == new_schedule:
        log.debug("autoscrim_noop", message="Autoscrim configuration did not change.")
        return
    if not settings.GCLOUD_ENABLE_ACTIONS:
        log.warn(
            "autoscrim_disabled",
            message="Not updating autoscrims as actions are disabled.",
        )
        return

    # Autoscrims are always best of 3. Future devs are welcome to change this if they
    # wish, perhaps by adding `best_of` as a column in the Episode model.
    best_of = 3

    parent = f"projects/{settings.GCLOUD_PROJECT}/locations/{settings.GCLOUD_LOCATION}"
    job_name = (
        f"{parent}/jobs/"
        f"{settings.GCLOUD_SCHEDULER_PREFIX}-autoscrim-{instance.name_short}"
    )
    url = "https://{}{}".format(
        settings.ALLOWED_HOSTS[0],
        reverse("episode-autoscrim", kwargs={"pk": instance.pk}),
    )
    job = scheduler.Job(
        name=job_name,
        description=f"Autoscrims for {instance.name_short} ({instance.name_long})",
        http_target=scheduler.HttpTarget(
            uri=url,
            http_method=scheduler.HttpMethod.POST,
            headers={
                "Content-Type": "application/json; charset=utf-8",
            },
            body=json.dumps({"best_of": best_of}).encode(),
            oidc_token=scheduler.OidcToken(
                service_account_email=settings.GCLOUD_SERVICE_EMAIL,
            ),
        ),
        schedule=new_schedule,
        time_zone=settings.TIME_ZONE,
    )

    client = scheduler.CloudSchedulerClient(credentials=settings.GCLOUD_CREDENTIALS)
    if old_schedule is None:
        log.info("autoscrim_create", message="Creating autoscrim schedule.")
        client.create_job(request=dict(parent=parent, job=job))
    elif new_schedule is None:
        log.info("autoscrim_delete", message="Deleting autoscrim schedule.")
        client.delete_job(request=dict(name=job_name))
    else:
        log.info("autoscrim_modify", message="Updating autoscrim schedule.")
        client.update_job(request=dict(job=job))


@receiver(pre_save, sender=Match)
def report_for_tournament(instance, **kwargs):
    """
    If a match is associated with a tournament bracket,
    update that tournament bracket.
    """

    # Note that if a match is already finalized, and Saturn tries to report it again,
    # the match will not save.
    # Thus the call to the bracket service will not be made.
    # No need to worry about redundant calls to an API (and thus
    # blowing thru api usage limits, if those exist).

    if instance.status == SaturnStatus.COMPLETED and instance.bracket_id is not None:
        # NOTE: not sure where the code that derives the match's tournament
        # should live. Question of abstraction?
        # Open to suggestions, track in #549
        instance.tournament_round.tournament.report_for_tournament(instance)
