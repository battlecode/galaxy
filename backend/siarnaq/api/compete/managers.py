from django.conf import settings
from django.db import models
from django.db.models import OuterRef, Subquery
from google.cloud import pubsub


class SaturnInvokableQuerySet(models.QuerySet):
    _publish_client = pubsub.PublisherClient(
        publisher_options=pubsub.types.PublisherOptions(
            enable_message_ordering=True,
        ),
        client_options={
            "api_endpoint": "us-east1-pubsub.googleapis.com:443",
        },
    )

    @property
    def _publish_topic(self):
        """The name of the topic to which queued items should be published."""
        raise NotImplementedError

    @property
    def _publish_ordering_key(self):
        """The ordering key with which to ensure FIFO order of queued items."""
        raise NotImplementedError

    def enqueue(self):
        """Enqueue all unqueued items in this queryset for invocation on Saturn."""
        raise NotImplementedError


class SubmissionQuerySet(SaturnInvokableQuerySet):
    @property
    def _publish_topic(self):
        return settings.COMPETE_SATURN_COMPILE_TOPIC

    @property
    def _publish_ordering_key(self):
        return settings.COMPETE_SATURN_COMPILE_ORDER


class MatchParticipantManager(models.Manager):
    def bulk_create(self, objs, **kwargs):
        """
        Create a collection of match participations in bulk, and set up the linked list
        connections for participations in all teams involved. It is required that these
        objects have the `submission` field set.

        Note that signals are not sent by bulk creation.

        See Also
        --------
        siarnaq.api.compete.signals.connect_linked_list :
            A post_save signal that performs the equivalent linked-list insertion
            performed by this method.
        """
        objs = list(objs)
        if any(obj.submission_id is None for obj in objs):
            raise ValueError("Must set MatchParticipant.submission to use bulk_create")
        objs = super().bulk_create(objs, **kwargs)
        self.model.objects.filter(pk__in=[obj.pk for obj in objs]).update(
            previous_participation=Subquery(
                self.model.objects.filter(team=OuterRef("team"), pk__lt=OuterRef("pk"))
                .order_by("-pk")
                .values("pk")[:1]
            )
        )
        return objs


class MatchQuerySet(SaturnInvokableQuerySet):
    @property
    def _publish_topic(self):
        return settings.COMPETE_SATURN_EXECUTE_TOPIC

    @property
    def _publish_ordering_key(self):
        return settings.COMPETE_SATURN_EXECUTE_ORDER


class ScrimmageRequestQuerySet(models.QuerySet):
    def pending(self):
        """Filter for all scrimmage requests that are in a pending state."""
        raise NotImplementedError

    def accept(self):
        """
        Accept all pending scrimmage requests in this queryset.
        Returns the number of accepted requests.
        """
        raise NotImplementedError

    def reject(self):
        """
        Reject all pending scrimmage requests in this queryset.
        Returns the number of rejected requests.
        """
        raise NotImplementedError

    def cancel(self):
        """
        Cancel all pending scrimmage requests in this queryset.
        Returns the number of cancelled requests.
        """
        raise NotImplementedError
