from django.test import RequestFactory, TestCase
from google.auth.exceptions import DefaultCredentialsError
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from siarnaq.api.user.models import User


class GoogleCloudAuthenticationTest(TestCase):
    """Test suite for token-based authentication for Google Cloud service accounts."""

    def setUp(self):
        User.objects.create_user(username="user")
        self.factory = RequestFactory()

    def get_gcloud_token(self, audience):
        """Generate an OIDC token for the service account to be authenticated."""
        try:
            return id_token.fetch_id_token(requests.Request(), audience)
        except DefaultCredentialsError as e:
            self.skipTest("Could not get ID token: " + str(e))

    # Partitions:
    # User agent: internal, not internal
    # Token: valid for gcloud account, valid for regular user, invalid, missing

    def test_token_internal_valid_gcloud(self):
        token = self.get_gcloud_token("audience")
        request = self.factory.get(
            "/api/",
            HTTP_USER_AGENT="Galaxy-Saturn",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        request = APIView().initialize_request(request)
        self.assertTrue(request.user.is_authenticated)
        self.assertTrue(request.user.is_staff)

    def test_token_internal_valid_regular(self):
        token = RefreshToken.for_user(User.objects.get()).access_token
        request = self.factory.get(
            "/api/",
            HTTP_USER_AGENT="Galaxy-Saturn",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        request = APIView().initialize_request(request)
        with self.assertRaises(AuthenticationFailed):
            request.user

    def test_token_external_valid_gcloud(self):
        token = self.get_gcloud_token("audience")
        request = self.factory.get("/api/", HTTP_AUTHORIZATION=f"Bearer {token}")
        request = APIView().initialize_request(request)
        with self.assertRaises(AuthenticationFailed):
            request.user

    def test_token_external_valid_regular(self):
        token = RefreshToken.for_user(User.objects.get()).access_token
        request = self.factory.get("/api/", HTTP_AUTHORIZATION=f"Bearer {token}")
        request = APIView().initialize_request(request)
        self.assertTrue(request.user.is_authenticated)
        self.assertFalse(request.user.is_staff)

    def test_token_invalid(self):
        token = "not.a.token"
        request = self.factory.get("/api/", HTTP_AUTHORIZATION=f"Bearer {token}")
        request = APIView().initialize_request(request)
        with self.assertRaises(AuthenticationFailed):
            request.user

    def test_token_missing(self):
        request = self.factory.get("/api/")
        request = APIView().initialize_request(request)
        self.assertFalse(request.user.is_authenticated)
