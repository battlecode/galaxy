from django.db import transaction
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from siarnaq.api.teams.models import Team, TeamProfile
from siarnaq.api.user.serializers import UserNestedSerializer


@extend_schema_field(OpenApiTypes.DOUBLE)
class RatingField(serializers.Field):
    def to_representation(self, instance):
        if instance is None:
            return None
        else:
            return instance.value


class TeamProfilePublicSerializer(serializers.ModelSerializer):
    rating = RatingField(read_only=True)

    class Meta:
        model = TeamProfile
        fields = [
            "quote",
            "biography",
            "has_avatar",
            "rating",
            "auto_accept_ranked",
            "auto_accept_unranked",
            "eligible_for",
        ]
        read_only_fields = ["rating"]


class TeamPublicSerializer(serializers.ModelSerializer):
    profile = TeamProfilePublicSerializer(required=False)
    members = UserNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ["id", "profile", "episode", "name", "members", "status"]
        read_only_fields = ["id", "episode", "members", "status"]

    def create(self, *args, **kwargs):
        raise RuntimeError("Operation disabled for public serializer")

    def update(self, *args, **kwargs):
        raise RuntimeError("Operation disabled for public serializer")


class TeamProfilePrivateSerializer(TeamProfilePublicSerializer):
    rating = RatingField(read_only=True)

    class Meta:
        model = TeamProfile
        fields = [
            "quote",
            "biography",
            "has_avatar",
            "rating",
            "auto_accept_ranked",
            "auto_accept_unranked",
            "eligible_for",
        ]
        read_only_fields = ["rating"]

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


class TeamPrivateSerializer(TeamPublicSerializer):
    profile = TeamProfilePrivateSerializer(required=False)

    class Meta:
        model = Team
        fields = ["id", "profile", "episode", "name", "members", "join_key", "status"]
        read_only_fields = ["id", "episode", "members", "join_key", "status"]

    def to_internal_value(self, data):
        """
        Use the episode ID provided in URL as the team's episode.
        """
        ret = super().to_internal_value(data)
        # TODO: this prevents some validation (e.g. uniqueness of (episode, team)),
        # which is undesirable.
        ret.update(episode_id=self.context["view"].kwargs.get("episode_id"))
        return ret

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


class TeamJoinSerializer(serializers.Serializer):
    join_key = serializers.CharField()
    name = serializers.CharField()
