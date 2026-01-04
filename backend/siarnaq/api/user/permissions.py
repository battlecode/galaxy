from django.conf import settings
from rest_framework.permissions import BasePermission


class IsEmailVerified(BasePermission):
    """Allows access only to users with verified email addresses."""

    message = "Please verify your email address to access this resource."

    def has_permission(self, request, view):
        if not getattr(settings, "EMAIL_VERIFICATION_REQUIRED", True):
            return request.user and request.user.is_authenticated

        if request.user and request.user.is_staff:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.email_verified
        )
