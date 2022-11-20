import io
from typing import BinaryIO

import google.cloud.storage as storage

from .auth import credentials, enable_actions


class RequestRefused(Exception):
    """
    RequestRefused may be raised if a request to download a file is blocked for safety
    reasons. This is the base class for all Titan-related exceptions.
    """

    reason = "This request was refused for an unknown reason."


class FileUnverified(RequestRefused):
    """FileUnverified is raised when an unverified file is requested."""

    reason = (
        "This file is still being processed. "
        "It should be ready within a minute or two."
    )


class FileMalicious(RequestRefused):
    """FileMalicious is raised when a file marked as malicious is requested."""

    reason = (
        "This file was not automatically cleared and requires manual review. "
        "You may either wait, or if you own this file, replace it with a new upload."
    )


def request_scan(blob: storage.Blob) -> None:
    """Request that Titan scan a blob for malware."""
    blob.metadata = {"Titan-Status": "Unverified"}
    blob.patch()


def get_object(bucket: str, name: str) -> BinaryIO:
    """Retrieve a file if Titan has marked it as safe."""
    if not enable_actions:
        return io.BytesIO()
    client = storage.Client(credentials=credentials)
    blob = client.bucket(bucket).get_blob(name)
    match blob.metadata:
        case {"Titan-Status": "Unverified"}:
            raise FileUnverified
        case {"Titan-Status": "Verified"}:
            return blob.open("rb")
        case {"Titan-Status": "Malicious"}:
            raise FileMalicious
        case _:
            raise RequestRefused
