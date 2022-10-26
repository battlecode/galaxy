from django.conf import settings
from django.db import models
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
