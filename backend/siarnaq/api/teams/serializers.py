from django.db import transaction
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers, validators

from siarnaq.api.episodes.models import Episode
from siarnaq.api.teams.models import ClassRequirement, Team, TeamProfile
from siarnaq.api.user.serializers import UserPublicSerializer


@extend_schema_field(OpenApiTypes.DOUBLE)
class RatingField(serializers.Field):
    def to_representation(self, instance):
        if instance is None:
            return None
        else:
            return instance.value


class TeamProfilePublicSerializer(serializers.ModelSerializer):
    rating = RatingField(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamProfile
        fields = [
            "quote",
            "biography",
            "has_avatar",
            "avatar_url",
            "rating",
            "auto_accept_ranked",
            "auto_accept_unranked",
            "eligible_for",
        ]
        read_only_fields = ["rating", "has_avatar", "avatar_url"]

    def get_avatar_url(self, obj):
        return obj.get_avatar_url()


class TeamPublicSerializer(serializers.ModelSerializer):
    profile = TeamProfilePublicSerializer(required=False)
    members = UserPublicSerializer(many=True, read_only=True)
    has_active_submission = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            "id",
            "profile",
            "episode",
            "name",
            "members",
            "status",
            "has_active_submission",
        ]
        read_only_fields = ["id", "episode", "members", "status"]

    def create(self, *args, **kwargs):
        raise RuntimeError("Operation disabled for public serializer")

    def update(self, *args, **kwargs):
        raise RuntimeError("Operation disabled for public serializer")

    def get_has_active_submission(self, obj):
        return obj.has_active_submission()


class TeamProfilePrivateSerializer(TeamProfilePublicSerializer):
    rating = RatingField(read_only=True)

    class Meta:
        model = TeamProfile
        fields = [
            "quote",
            "biography",
            "has_avatar",
            "avatar_url",
            "rating",
            "auto_accept_ranked",
            "auto_accept_unranked",
            "eligible_for",
        ]
        read_only_fields = ["rating", "has_avatar", "avatar_url"]

    def create(self, validated_data):
        eligible_for = validated_data.pop("eligible_for", None)
        profile = super(TeamProfilePublicSerializer, self).create(validated_data)
        if eligible_for is not None:
            profile.eligible_for.set(eligible_for)
        return profile

    def update(self, instance, validated_data):
        eligible_for = validated_data.pop("eligible_for", None)
        instance = super(TeamProfilePublicSerializer, self).update(
            instance, validated_data
        )
        if eligible_for is not None:
            instance.eligible_for.set(eligible_for)
        return instance


class CurrentEpisodeDefault:
    """Returns a default value for the episode given by the value in context."""

    requires_context = True

    def __call__(self, serializer_field):
        episode_id = serializer_field.context["view"].kwargs.get("episode_id")
        return Episode.objects.get(pk=episode_id)


class TeamPrivateSerializer(TeamPublicSerializer):
    profile = TeamProfilePrivateSerializer(required=False)
    episode = serializers.PrimaryKeyRelatedField(
        default=CurrentEpisodeDefault(), queryset=Episode.objects.all()
    )

    class Meta:
        model = Team
        fields = ["id", "profile", "episode", "name", "members", "join_key", "status"]
        read_only_fields = ["id", "name", "members", "join_key", "status"]

    @transaction.atomic
    def create(self, validated_data):
        team = Team.objects.create(**validated_data)

        # Add self to team
        request = self.context.get("request")
        team.members.add(request.user)
        return team

    def update(self, instance, validated_data):
        if profile_data := validated_data.pop("profile", None):
            profile_serializer = self.fields["profile"]
            profile = instance.profile
            profile_serializer.update(profile, profile_data)

        return super(TeamPublicSerializer, self).update(instance, validated_data)


class TeamCreateSerializer(TeamPrivateSerializer):
    class Meta:
        model = Team
        fields = ["id", "profile", "episode", "name", "members", "join_key", "status"]
        read_only_fields = ["id", "members", "join_key", "status"]
        validators = [
            validators.UniqueTogetherValidator(
                queryset=Team.objects.all(),
                fields=["episode", "name"],
            )
        ]

    def update(self, instance, validated_data):
        raise NotImplementedError("Use UserPrivateSerializer to update users.")


class TeamJoinSerializer(serializers.Serializer):
    join_key = serializers.CharField()
    name = serializers.CharField()


class TeamAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(write_only=True)


class ClassRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRequirement
        fields = [
            "episode",
            "reference_player",
            "maps",
            "min_score",
        ]


class UserPassedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    passed = serializers.BooleanField()


class TeamReportSerializer(serializers.Serializer):
    report = serializers.FileField(write_only=True)
