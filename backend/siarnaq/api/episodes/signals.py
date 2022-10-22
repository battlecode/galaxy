from django.conf import settings
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.urls import reverse
from google.cloud import scheduler

from siarnaq.api.episodes.models import Episode


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
    if old_schedule == new_schedule:
        return

    parent = (
        f"projects/{settings.GOOGLE_CLOUD_PROJECT_ID}/"
        f"locations/{settings.GOOGLE_CLOUD_LOCATION}"
    )
    job_name = f"{parent}/jobs/autoscrim_{instance.name_short}"
    job = scheduler.Job(
        name=job_name,
        description=f"Autoscrims for {instance.name_short} ({instance.name_long})",
        http_target=scheduler.HttpTarget(
            uri=reverse(...),  # TODO get the uri
            http_method=scheduler.HttpMethod.POST,
            oidc_token=scheduler.OidcToken(service_account_email=...),
        ),
        schedule=new_schedule,
        time_zone=settings.TIME_ZONE,
    )

    client = scheduler.CloudSchedulerClient()
    if old_schedule is None:
        client.create_job(request=dict(parent=parent, job=job))
    elif new_schedule is None:
        client.delete_job(request=dict(name=job_name))
    else:
        client.update_job(request=dict(job=job))
