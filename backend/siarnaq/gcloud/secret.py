import google.cloud.secretmanager as secretmanager

from .auth import credentials, project_id


def get_secret(name: str, version: str = "latest") -> bytes:
    """Access the secret version from the Google Secret Manager."""
    client = secretmanager.SecretManagerServiceClient(credentials=credentials)
    request = secretmanager.AccessSecretVersionRequest(
        name=client.secret_version_path(project_id, name, version)
    )
    return client.access_secret_version(request=request).payload.data
