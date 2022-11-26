import structlog
from django.conf import settings
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

from siarnaq.api.user.models import User

logger = structlog.get_logger(__name__)


class GoogleCloudAuthentication(authentication.BaseAuthentication):
    """
    Authenticate the Google Cloud service account for the internal API.

    Some internal services in Galaxy need to make privileged API calls, and we want to
    authenticate them in a password-free way. This can be achieved by assuming the
    Google Cloud service account identity, which we verify here.
    """

    INTERNAL_API_USER_AGENTS = ["Google-Cloud-Scheduler", "Galaxy-Saturn"]
    """
    User agents from which an internal API call could originate. Requests with one of
    these user agent headers will be authenticated with this method, and denied access
    if authentication fails.
    """

    AUTHORIZATION_HEADER_TYPE = "Bearer"
    """The supported authorization scheme."""

    WWW_AUTHENTICATE_REALM = "api"
    """Realm for any WWW-Authenticate headers returned in a HTTP 401 response."""

    def authenticate(self, request):
        """Try to authenticate a request as the Google Cloud service agent."""
        user_agent = request.META.get("HTTP_USER_AGENT")
        if user_agent not in self.INTERNAL_API_USER_AGENTS:
            return None  # Not an attempt to authorize
        header = request.META.get("HTTP_AUTHORIZATION")
        if not header:
            return None  # Not an attempt to authorize

        try:
            method, token = header.split()
        except ValueError:
            logger.warn(
                "admin_malformed", message="Admin provided malformed credentials."
            )
            raise AuthenticationFailed("Malformed authorization header")
        if method.lower() != self.AUTHORIZATION_HEADER_TYPE.lower():
            logger.warn(
                "admin_unsupported", message="Admin provided unsupported credentials."
            )
            raise AuthenticationFailed("Unsupported authorization scheme")

        try:
            idinfo = id_token.verify_oauth2_token(
                id_token=token,
                request=requests.Request(),
            )
        except (ValueError, GoogleAuthError):
            logger.warn(
                "admin_invalid", message="Admin provided invalid authentication token."
            )
            raise AuthenticationFailed("Invalid authorization token")
        if idinfo.get("email") not in settings.GALAXY_ADMIN_EMAILS:
            logger.warn(
                "admin_unauthorized", message="Admin provided unauthorized identity."
            )
            raise AuthenticationFailed("Unauthorized client")

        user, _ = User.objects.get_or_create(
            username=settings.GALAXY_ADMIN_USERNAME,
            is_staff=True,
        )
        logger.info("admin_authenticated", message="Admin has been authenticated.")
        return (user, None)

    def authenticate_header(self, request):
        """Return the challenge for the WWW-Authenticate header."""
        return f'{self.AUTHORIZATION_HEADER_TYPE} realm="{self.WWW_AUTHENTICATE_REALM}"'
