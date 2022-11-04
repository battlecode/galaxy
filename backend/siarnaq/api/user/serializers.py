from rest_framework import serializers

from siarnaq.api.user.models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
        extra_kwargs = {"password": {"write_only": True}}


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=True)

    class Meta:
        model = UserProfile
        fields = [
            "user",
            "gender",
            "gender_details",
            "date_of_birth",
            "school",
            "biography",
            "kerberos",
            "has_avatar",
            "has_resume",
        ]

    def create(self, validated_data):
        # Create user
        user_data = validated_data.pop("user")
        user = User.objects.create_user(**user_data)
        # Create associated user profile
        user_profile = UserProfile.objects.create(user=user, **validated_data)
        return user_profile


class UserResumeSerializer(serializers.Serializer):
    resume = serializers.FileField(write_only=True)


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]


class PublicUserProfileSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(required=True)

    class Meta:
        model = UserProfile
        fields = ["user", "school", "biography", "has_avatar"]
