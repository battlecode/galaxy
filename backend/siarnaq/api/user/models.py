from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    A database model for the basic information about a user account.
    """

    pass


class Gender(models.TextChoices):
    """
    An immutable type enumerating the available gender selections.
    """

    WOMAN = "W"
    MAN = "M"
    NON_BINARY = "N"
    CUSTOM = "*"
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

    date_of_birth = models.DateField()
    """The date of birth of the user."""

    school = models.CharField(max_length=128, blank=True)
    """The school that this user attends, if provided."""

    biography = models.TextField(max_length=1024, blank=True)
    """The biography provided by the user, if any."""

    kerberos = models.SlugField(max_length=16, blank=True)
    """The kerberos username of the user, if an MIT student."""

    has_avatar = models.BooleanField(default=False)
    """Whether the user has an uploaded avatar."""

    has_resume = models.BooleanField(default=False)
    """Whether the user has an uploaded resume."""

    REQUIRED_FIELDS = ["email", "first_name", "last_name", "gender", "data_of_birth"]
