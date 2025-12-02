import datetime
import io
import json

import google.cloud.storage as storage
import structlog
from django.conf import settings
from google.auth import impersonated_credentials
from PIL import Image

from siarnaq.gcloud import saturn

logger = structlog.get_logger(__name__)


def request_scan(blob: storage.Blob) -> None:
    """Request that Titan scan a blob for malware."""
    logger.info("titan_request", message="Requesting scan on file.", file=blob.name)

    # Set metadata to Unverified before publishing to Pub/Sub
    blob.metadata = {"Titan-Status": "Unverified"}
    blob.patch()

    # Publish scan request to Pub/Sub topic
    if not settings.GCLOUD_ENABLE_ACTIONS:
        logger.warn("titan_disabled", message="Titan scan queue is disabled.")
        return

    publish_client = saturn.get_publish_client()
    topic = publish_client.topic_path(
        settings.GCLOUD_PROJECT, settings.GCLOUD_TOPIC_SCAN
    )

    payload = {
        "bucket": blob.bucket.name,
        "name": blob.name,
    }

    try:
        future = publish_client.publish(
            topic=topic,
            data=json.dumps(payload).encode(),
            ordering_key=settings.GCLOUD_ORDER_SCAN,
        )
        message_id = future.result()
        logger.info(
            "titan_enqueued",
            message="Scan request has been queued.",
            message_id=message_id,
            bucket=blob.bucket.name,
            file=blob.name,
        )
    except Exception:
        logger.error(
            "titan_publish_error",
            message="Scan request could not be queued.",
            exc_info=True,
            bucket=blob.bucket.name,
            file=blob.name,
        )
        publish_client.resume_publish(
            topic=topic,
            ordering_key=settings.GCLOUD_ORDER_SCAN,
        )


def get_object(
    bucket: str, name: str, check_safety: bool, get_raw: bool = False
) -> dict[str, str | bytes | bool]:
    """
    Retrieve a file from storage, performing safety checks if required.

    Parameters
    ----------
    bucket : str
        The bucket from which the object should be retrieved.
    name : str
        The name (full path) of the object in the bucket.
    check_safety : bool
        Whether the object should only be returned if verified by Titan.
    get_raw : bool
        Whether to return the raw file contents instead of a URL.

    Returns
    -------
    dict[str, str]
        A dictionary consisting of a boolean field "ready" indicating whether the file
        has passed any requested safety checks.

        If this is true, then an additional field will be available for retrieving the
        file: either a field "url" with a signed download link, or "data" with the raw
        data.

        Otherwise, a field "reason" is available explaining why the file cannot be
        downloaded.
    """
    log = logger.bind(bucket=bucket, name=name)
    if not settings.GCLOUD_ENABLE_ACTIONS:
        log.warn("titan_disabled", message="Titan is disabled.")
        return {"ready": True, "url": ""}

    client = storage.Client(credentials=settings.GCLOUD_CREDENTIALS)
    blob = client.bucket(bucket).get_blob(name)
    match (check_safety, blob.metadata):
        case (False, _) | (True, {"Titan-Status": "Verified"}):
            if get_raw:
                return {
                    "ready": True,
                    "data": blob.download_as_bytes(),
                }
            # Signing is complicated due to an issue with the Google Auth library.
            # See: https://github.com/googleapis/google-auth-library-python/issues/50
            signing_credentials = impersonated_credentials.Credentials(
                source_credentials=settings.GCLOUD_CREDENTIALS,
                target_principal=settings.GCLOUD_SERVICE_EMAIL,
                target_scopes="https://www.googleapis.com/auth/devstorage.read_only",
                lifetime=5,
            )
            url = blob.generate_signed_url(
                expiration=datetime.timedelta(hours=1),
                method="GET",
                credentials=signing_credentials,
            )
            log.debug("titan_success", message="Generated signed download URL.")
            return {
                "ready": True,
                "url": url,
            }
        case (_, {"Titan-Status": "Unverified"}):
            log.debug("titan_unverified", message="File is still unverified.")
            return {
                "ready": False,
                "reason": (
                    "This file is still being processed. It should be ready within a "
                    "minute or two."
                ),
            }
        case (_, {"Titan-Status": "Malicious"}):
            log.warn("titan_malicious", message="File is malicious.")
            return {
                "ready": False,
                "reason": (
                    "This file was not automatically cleared and requires manual "
                    "review. You may either wait, or if you own this file, replace it "
                    "with a new upload."
                ),
            }
        case _:
            raise ValueError("Unexpected state.")


def upload_image(raw_image, image_path):
    img = Image.open(raw_image)
    img.thumbnail(settings.GCLOUD_MAX_AVATAR_SIZE)

    # Prepare image bytes for upload to Google Cloud
    # See https://stackoverflow.com/a/71094317
    bytestream = io.BytesIO()
    img.save(bytestream, format="png")
    img_bytes = bytestream.getvalue()

    if not settings.GCLOUD_ENABLE_ACTIONS:
        logger.warn("avatar_disabled", message="Avatar uploads are disabled.")
    else:
        logger.info("avatar_upload", message="Uploading avatar.")
        client = storage.Client()
        blob = client.bucket(settings.GCLOUD_BUCKET_PUBLIC).blob(image_path)
        blob.upload_from_string(img_bytes)
