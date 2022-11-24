from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from siarnaq.api.user.models import User, UserProfile


class UserNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]
        read_only_fields = ["id", "username"]


class UserProfilePublicSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["school", "biography", "avatar_url"]

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
    class Meta:
        model = UserProfile
        fields = [
            "gender",
            "gender_details",
            "school",
            "biography",
            "kerberos",
            "avatar_url",
            "has_resume",
            "country",
        ]
        read_only_fields = ["has_resume"]


class UserPrivateSerializer(UserPublicSerializer):
    profile = UserProfilePrivateSerializer(required=False)

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
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"validators": []},
            "email": {"validators": []},
        }

    def create(self, validated_data):
        return User.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if profile_data := validated_data.pop("profile", None):
            profile_serializer = self.fields["profile"]
            profile = instance.profile
            profile_serializer.update(profile, profile_data)

        return super(UserPublicSerializer, self).update(instance, validated_data)

    def validate_password(self, password):
        """
        Automatically hash password upon validation.
        See https://stackoverflow.com/a/54752925.
        """
        return make_password(password)

    def _validate_unique_field(self, field_name, field_value):
        """
        Custom validator that permits for a field to be "updated" to the same value
        as its current one. See https://stackoverflow.com/a/56171137.
        """
        # A keyword argument trick to filter by field_name=field_value
        # with dynamic field_name.
        # See https://stackoverflow.com/a/310785
        check_query = User.objects.filter(**{field_name: field_value})
        if self.instance:
            check_query = check_query.exclude(pk=self.instance.pk)

        if check_query.exists():
            raise serializers.ValidationError(
                f"A user with that {field_name} already exists."
            )

        return field_value

    def validate_username(self, username):
        return self._validate_unique_field("username", username)

    def validate_email(self, username):
        return self._validate_unique_field("email", username)


class UserResumeSerializer(serializers.Serializer):
    resume = serializers.FileField(write_only=True)
    ready = serializers.BooleanField(read_only=True)
    url = serializers.URLField(read_only=True)
    reason = serializers.CharField(read_only=True)


class UserAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(write_only=True)
