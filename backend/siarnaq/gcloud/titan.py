import datetime

import google.cloud.storage as storage
import structlog
from django.conf import settings
from google.auth import impersonated_credentials

logger = structlog.get_logger(__name__)


def request_scan(blob: storage.Blob) -> None:
    """Request that Titan scan a blob for malware."""
    # Titan responds to google.cloud.storage.object.v1.metadataUpdated events via
    # Eventarc, so it suffices to set the Titan metadata field.
    logger.info("titan_request", message="Requesting scan on file.", file=blob.name)
    blob.metadata = {"Titan-Status": "Unverified"}
    blob.patch()


def get_object(bucket: str, name: str, check_safety: bool) -> dict[str, str | bool]:
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

    Returns
    -------
    dict[str, str]
        A dictionary consisting of a boolean field "ready" indicating whether the file
        has passed any requested safety checks. If this is true, then an additional
        field "url" is supplied with a signed download link. Otherwise, a field "reason"
        is available explaining why the file cannot be downloaded.
    """
    log = logger.bind(bucket=bucket, name=name)
    if not settings.GCLOUD_ENABLE_ACTIONS:
        log.warn("titan_disabled", message="Titan is disabled.")
        return {"ready": True, "url": ""}

    client = storage.Client(credentials=settings.GCLOUD_CREDENTIALS)
    blob = client.bucket(bucket).get_blob(name)
    match (check_safety, blob.metadata):
        case (False, _) | (True, {"Titan-Status": "Verified"}):
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
