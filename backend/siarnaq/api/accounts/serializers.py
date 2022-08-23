from rest_framework import serializers

from siarnaq.api.accounts.models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "user",
            "gender",
            "gender_details",
            "school",
            "biography",
            "kerberos",
            "has_avatar",
            "has_resume",
        ]
