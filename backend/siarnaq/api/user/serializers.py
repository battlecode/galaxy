from rest_framework import serializers

from siarnaq.api.user.models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "first_name", "last_name"]
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"validators": []},
        }

    # Handle password hashes in update, which is important since this function
    # is called from the user profile serializer.
    # See https://stackoverflow.com/a/49190645.
    def update(self, instance, validated_data):
        if "password" in validated_data:
            instance.set_password(validated_data.pop("password"))
        super().update(instance, validated_data)

    # Custom validator that permits for the username to be "updated" to the same value
    # as its current one. See https://stackoverflow.com/a/56171137.
    def validate_username(self, username):
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

    def update(self, instance, validated_data):
        # If updated user data provided, create updated user and put it in
        # validated data field. See https://stackoverflow.com/a/65972405
        if "user" in validated_data:
            user_serializer = self.fields["user"]
            user_instance = instance.user
            user_data = validated_data.pop("user")
            user_serializer.update(user_instance, user_data)

        return super().update(instance, validated_data)


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
