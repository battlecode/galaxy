import google.cloud.storage as storage
from django.contrib.auth.hashers import make_password
from django.db import transaction
from rest_framework import serializers

import siarnaq.gcloud as gcloud
from siarnaq.api.user.models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "is_staff",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"validators": []},
            "is_staff": {"read_only": True},
        }

    def validate_password(self, password):
        """
        Automatically hash password upon validation.
        See https://stackoverflow.com/a/54752925.
        """
        return make_password(password)

    def validate_username(self, username):
        """
        Custom validator that permits for the username to be "updated" to the same value
        as its current one. See https://stackoverflow.com/a/56171137.
        """
        check_query = User.objects.filter(username=username)
        if self.instance:
            check_query = check_query.exclude(pk=self.instance.pk)

        if self.parent is not None and self.parent.instance is not None:
            user_instance = self.parent.instance.user
            check_query = check_query.exclude(pk=user_instance.pk)

        if check_query.exists():
            raise serializers.ValidationError(
                "A user with that username already exists."
            )

        return username


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "user",
            "avatar_url",
            "gender",
            "gender_details",
            "school",
            "biography",
            "kerberos",
            "has_avatar",
            "has_resume",
            "country",
        ]

    def get_avatar_url(self, obj):

        if not obj.has_avatar:
            return ""

        client = storage.Client()
        public_url = (
            client.bucket(gcloud.public_bucket).blob(obj.get_avatar_path()).public_url
        )
        # Append UUID to public URL to prevent use of cached previous avatar
        return f"{public_url}?{obj.avatar_uuid}"

    def create(self, validated_data):
        # Create user
        user_serializer = self.fields["user"]
        user_data = validated_data.pop("user")
        # Create user and associated user profile
        with transaction.atomic():
            user = user_serializer.create(user_data)
            user_profile = UserProfile.objects.create(user=user, **validated_data)
        return user_profile

    def update(self, instance, validated_data):
        """
        If updated user data provided, create updated user and put it in
        validated data field. See https://stackoverflow.com/a/65972405
        """
        if "user" in validated_data:
            user_serializer = self.fields["user"]
            user_instance = instance.user
            user_data = validated_data.pop("user")
            user_serializer.update(user_instance, user_data)

        return super().update(instance, validated_data)


class UserResumeSerializer(serializers.Serializer):
    resume = serializers.FileField(write_only=True)


class UserAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(write_only=True)


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]


class PublicUserProfileSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(required=True)

    class Meta:
        model = UserProfile
        fields = ["user", "school", "biography", "has_avatar"]
