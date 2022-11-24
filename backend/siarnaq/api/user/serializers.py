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
            "email",
            "first_name",
            "last_name",
            "is_staff",
        ]
        read_only_fields = ["id", "username", "is_staff"]

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
