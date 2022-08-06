from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from google.api_core.exceptions import NotFound
from google.cloud import scheduler_v1
from google.cloud.scheduler_v1.types.job import Job

from backend.siarnaq.api.episodes.models import Episode
from backend.siarnaq.settings import GOOGLE_CLOUD_PROJECT_ID


def create_scheduler_client():
    return scheduler_v1.CloudSchedulerClient(
        client_options={
            "api_endpoint": "cloudscheduler.googleapis.com",
        },
    )


def get_job_parent(client):
    """Gets "projects/<PROJECT_ID>/locations/<LOCATION_ID>" """
    client.common_location_path(GOOGLE_CLOUD_PROJECT_ID, "us-east1")


def get_job_name(parent, name_short):
    """Gets "projects/<PROJECT_ID>/locations/<LOCATION_ID>/jobs/<name_short>" """
    return f"{parent}/jobs/{name_short}"


@receiver(post_save, sender=Episode)
def update_autoscrim_schedule(_, episode: Episode):
    """Updates or creates the autoscrim scheduler when an episode is saved."""
    # create cloud scheduler client
    scheduler_client = create_scheduler_client()

    # initialize request parameters
    parent = get_job_parent(scheduler_client)
    job_name = get_job_name(parent, episode.name_short)
    new_job = {
        # episode.name_short is a unique tag
        "name": job_name,
        "description": f"Autoscrim scheduler for {episode.name_long}.",
        "http_target": {
            # TODO fill this uri with our backend api endpoint for starting autoscrims
            "uri": "TODO",
            "oauth_token": "TODO",
        },
        "schedule": episode.autoscrim_schedule,
        "time_zone": "US/Eastern",
    }

    # update or create job
    try:
        cur_job = scheduler_client.get_job(name=job_name)

        if new_job["schedule"] is not None:
            if cur_job.schedule != new_job["schedule"]:
                # update with a new schedule
                scheduler_client.update_job(job=new_job)
            if cur_job.state == Job.State.PAUSED:
                # unpause if necessary
                scheduler_client.resume_job(name=job_name)
        elif new_job["schedule"] is None and cur_job.state != Job.State.PAUSED:
            # pause the job if autoscrim_schedule is blank
            scheduler_client.pause_job(name=job_name)
    except NotFound:
        # job doesn't exist, create it if autoscrim schedule is not blank
        if new_job["schedule"] is not None:
            scheduler_client.create_job(parent=parent, job=new_job)


@receiver(pre_delete, sender=Episode)
def delete_autoscrim_schedule(_, episode: Episode):
    """Deletes the autoscrim cloud scheduler if an episode is deleted"""
    # create cloud scheduler client
    scheduler_client = create_scheduler_client()
    job_name = get_job_name(get_job_parent(scheduler_client), episode.name_short)

    try:
        scheduler_client.delete_job(job_name)
    except NotFound:
        pass
