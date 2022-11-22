from typing import Any
from unittest.mock import patch

from django.conf import settings
from django.test import RequestFactory, TestCase
from google.auth.exceptions import GoogleAuthError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from siarnaq.api.user.models import User


def mock_verify_oauth2_token(id_token: str | bytes, request: Any) -> dict[str, Any]:
    if id_token not in {"correct", b"correct"}:
        raise GoogleAuthError
    return {
        "email": settings.GALAXY_ADMIN_EMAILS[0],
    }


@patch("google.oauth2.id_token.verify_oauth2_token", mock_verify_oauth2_token)
class GoogleCloudAuthenticationTest(TestCase):
    """Test suite for token-based authentication for Google Cloud service accounts."""

    def setUp(self):
        User.objects.create_user(username="user", email="user@example.com")
        self.factory = RequestFactory()

    # Partitions:
    # User agent: internal, not internal
    # Token: valid for gcloud account, valid for regular user, invalid, missing

    def test_token_internal_valid_gcloud(self):
        token = "correct"
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
        token = "correct"
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
