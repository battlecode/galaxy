import posixpath
import uuid

import google.cloud.storage as storage
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _
from django_countries.fields import CountryField

from siarnaq.api.user.managers import UserManager


class User(AbstractUser):
    """
    A database model for the basic information about a user account.
    """

    # Override AbstractUser fields to make them required.
    # See https://stackoverflow.com/questions/49134831/django-make-user-email-required
    # and https://github.com/django/django/blob/main/django/contrib/auth/models.py
    first_name = models.CharField(_("first name"), max_length=30, blank=False)
    last_name = models.CharField(_("last name"), max_length=30, blank=False)
    email = models.EmailField(_("email address"), blank=False, unique=True)

    objects = UserManager()

    def __init__(self, *args, profile=None, **kwargs):
        """Create a user object, ensuring it has a profile."""
        super().__init__(*args, **kwargs)
        if not hasattr(self, "profile"):
            profile = profile or {}
            self.profile = UserProfile(**profile)

    @transaction.atomic
    def save(self, *args, **kwargs):
        """Save a user object, ensuring it has a profile recorded in the database."""
        super().save(*args, **kwargs)
        if self.profile._state.adding:
            self.profile.save()


class Gender(models.TextChoices):
    """
    An immutable type enumerating the available gender selections.
    """

    FEMALE = "F"
    MALE = "M"
    NON_BINARY = "N"
    PREFER_TO_SELF_DESCRIBE = "*"
    RATHER_NOT_SAY = "?"


class UserProfile(models.Model):
    """
    A database model for the profile information augmenting a user account.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        primary_key=True,
        related_name="profile",
    )
    """The user being augmented by this profile."""

    gender = models.CharField(max_length=1, choices=Gender.choices)
    """The gender that describes the user."""

    gender_details = models.CharField(max_length=32, blank=True)
    """Any customized gender information that better describes the user."""

    school = models.CharField(max_length=128, blank=True)
    """The school that this user attends, if provided."""

    biography = models.TextField(max_length=1024, blank=True)
    """The biography provided by the user, if any."""

    kerberos = models.SlugField(max_length=16, blank=True)
    """The kerberos username of the user, if an MIT student."""

    has_avatar = models.BooleanField(default=False)
    """Whether the user has an uploaded avatar."""

    avatar_uuid = models.UUIDField(default=uuid.uuid4)
    """A unique ID to identify each new avatar upload."""

    has_resume = models.BooleanField(default=False)
    """Whether the user has an uploaded resume."""

    country = CountryField()
    """The country of the user."""

    def get_resume_path(self):
        """Return the path of the resume on Google cloud storage."""
        return posixpath.join("user", str(self.pk), "resume.pdf")

    def get_avatar_path(self):
        """Return the path of the avatar on Google cloud storage."""
        if not self.has_avatar:
            return None
        return posixpath.join("user", str(self.pk), "avatar.png")

    def get_avatar_url(self):
        """Return a cache-safe URL to the avatar."""
        # To circumvent caching of old avatars, we append a UUID that changes on each
        # update.
        if not self.has_avatar:
            return None

        client = storage.Client.create_anonymous_client()
        public_url = (
            client.bucket(settings.GCLOUD_BUCKET_PUBLIC)
            .blob(self.get_avatar_path())
            .public_url
        )
        # Append UUID to public URL to prevent caching on avatar update
        return f"{public_url}?{self.avatar_uuid}"
