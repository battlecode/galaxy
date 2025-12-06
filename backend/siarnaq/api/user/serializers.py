from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django_countries.serializer_fields import CountryField
from rest_framework import serializers

from siarnaq.api.user.models import EmailVerificationToken, User, UserProfile


class UserProfilePublicSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["school", "biography", "avatar_url", "has_avatar"]
        read_only_fields = ["has_avatar", "avatar_url"]

    def get_avatar_url(self, obj):
        return obj.get_avatar_url()


class UserPublicSerializer(serializers.ModelSerializer):
    profile = UserProfilePublicSerializer(required=False)

    class Meta:
        model = User
        fields = ["id", "profile", "username", "is_staff"]
        read_only_fields = ["id", "is_staff"]

    def create(self, *args, **kwargs):
        raise RuntimeError("Operation disabled for public serializer")

    def update(self, *args, **kwargs):
        raise RuntimeError("Operation disabled for public serializer")


class UserProfilePrivateSerializer(UserProfilePublicSerializer):
    # Couuntry field requires special serialization.
    # See https://github.com/SmileyChris/django-countries#django-rest-framework
    country = CountryField()

    class Meta:
        model = UserProfile
        fields = [
            "gender",
            "gender_details",
            "school",
            "biography",
            "kerberos",
            "avatar_url",
            "has_avatar",
            "has_resume",
            "country",
        ]
        read_only_fields = ["has_resume", "has_avatar", "avatar_url"]


class UserPrivateSerializer(UserPublicSerializer):
    profile = UserProfilePrivateSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "profile",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "email_verified",
        ]
        read_only_fields = ["id", "username", "is_staff", "email_verified"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        if profile_data := validated_data.pop("profile", None):
            profile_serializer = self.fields["profile"]
            profile = instance.profile
            profile_serializer.update(profile, profile_data)

        return super(UserPublicSerializer, self).update(instance, validated_data)


class UserCreateSerializer(UserPrivateSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "profile",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "is_staff",
        ]
        read_only_fields = ["id", "is_staff"]

    def update(self, instance, validated_data):
        raise NotImplementedError("Use UserPrivateSerializer to update users.")


class UserResumeSerializer(serializers.Serializer):
    resume = serializers.FileField(write_only=True)
    ready = serializers.BooleanField(read_only=True)
    url = serializers.URLField(read_only=True)
    reason = serializers.CharField(read_only=True)


class UserAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(write_only=True)


class EmailSerializer(serializers.Serializer):
    """Serializer for requesting an email verification token."""

    email = serializers.EmailField()


class VerifyTokenSerializer(serializers.Serializer):
    """Serializer for verifying an email verification token."""

    token = serializers.CharField()

    def validate(self, attrs):
        token = attrs.get("token")

        try:
            verification_token = EmailVerificationToken.objects.get(token=token)
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError({"token": ["Invalid token"]})

        expiry_time = settings.EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME
        expiry_date = verification_token.created_at + timedelta(hours=expiry_time)

        if timezone.now() > expiry_date:
            raise serializers.ValidationError({"token": ["Token has expired"]})

        attrs["verification_token"] = verification_token
        return attrs
