from concurrent.futures import Future

import google.cloud.pubsub as pubsub
import structlog
from django.conf import settings

logger = structlog.get_logger(__name__)


class NullPublisher:
    def publish(self, *args, **kwargs) -> Future:
        f: Future = Future()
        f.set_result("none")
        return f

    def resume_publish(self, *args, **kwargs) -> None:
        pass


def get_publish_client() -> pubsub.PublisherClient | NullPublisher:
    if not settings.GCLOUD_ENABLE_ACTIONS:
        logger.warn("saturn_disabled", message="Saturn queue is disabled.")
        return NullPublisher()

    return pubsub.PublisherClient(
        credentials=settings.GCLOUD_CREDENTIALS,
        publisher_options=pubsub.types.PublisherOptions(
            enable_message_ordering=True,
        ),
        client_options={
            "api_endpoint": "us-east1-pubsub.googleapis.com:443",
        },
    )
