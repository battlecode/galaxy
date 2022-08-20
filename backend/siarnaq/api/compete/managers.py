import json

from django.conf import settings
from django.db import models, transaction
from google.cloud import pubsub_v1


class SaturnInvokableQuerySet(models.QuerySet):
    _publish_client = pubsub_v1.PublisherClient(
        publisher_options=pubsub_v1.types.PublisherOptions(
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

    @transaction.atomic
    def enqueue(self):
        """Enqueue all unqueued items in this queryset for invocation on Saturn."""
        invocations = (
            self.select_for_update()
            .filter(status=self.model.SaturnStatus.CREATED)
            .all()
        )
        futures = [
            self._publish_client.publish(
                topic=self._publish_topic,
                data=json.encode(invocation.enqueue_options()),
                ordering_key=self._publish_ordering_key,
            )
            for invocation in invocations
        ]
        for invocation, future in zip(invocations, futures):
            try:
                message_id = future.result()
                # TODO: log the message_id
                invocation.status = self.model.SaturnStatus.QUEUED
                invocation.logs = f"Enqueued with ID: {message_id}"
            except Exception:
                invocation.status = self.model.SaturnStatus.ERRORED
                self._publish_client.resume_publish(
                    topic=self._publish_topic,
                    ordering_key=self._publish_ordering_key,
                )
                # TODO: log the error
            finally:
                invocation.save(update_fields=["status", "logs"])


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
        return self.filter(status=self.model.ScrimmageRequestStatus.PENDING)

    @transaction.atomic
    def accept(self):
        """
        Accept all pending scrimmage requests in this queryset.
        Returns the number of accepted requests.
        """
        num_accepted = 0
        for request in self.pending().select_for_update().iterator():
            with transaction.atomic():
                request.status = self.model.ScrimmageRequestStatus.ACCEPTED
                request.save(update_fields=["status"])
                request.create_match()
                num_accepted += 1
        return num_accepted

    def reject(self):
        """
        Reject all pending scrimmage requests in this queryset.
        Returns the number of rejected requests.
        """
        return self.pending().update(status=self.model.ScrimmageRequestStatus.REJECTED)

    def cancel(self):
        """
        Cancel all pending scrimmage requests in this queryset.
        Returns the number of cancelled requests.
        """
        return self.pending().update(status=self.model.ScrimmageRequestStatus.CANCELLED)
