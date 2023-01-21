import google.cloud.tasks_v2 as tasks_v2
import structlog
from django.conf import settings

logger = structlog.get_logger(__name__)


class NullClient:
    def create_task(self, *args, **kwargs) -> None:
        return None

    def queue_path(self, *args, **kwargs) -> str:
        return "nothing"


def get_task_client() -> tasks_v2.CloudTasksClient | NullClient:
    if not settings.GCLOUD_ENABLE_ACTIONS:
        logger.warn("tasks_disabled", message="Async task queue is disabled.")
        return NullClient()

    return tasks_v2.CloudTasksClient()
