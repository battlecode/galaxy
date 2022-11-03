from django.db import transaction
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    SaturnStatus,
    ScrimmageRequest,
    Submission,
)
from siarnaq.api.episodes.models import Map
from siarnaq.api.teams.models import Team, TeamStatus
from siarnaq.api.teams.serializers import RatingField


class SaturnInvocationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(SaturnStatus.choices)
    logs = serializers.CharField(required=False)


class SubmissionSerializer(serializers.ModelSerializer):
    teamname = serializers.CharField(source="team.name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    source_code = serializers.FileField(write_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "status",
            "logs",
            "episode",
            "team",
            "teamname",
            "user",
            "username",
            "created",
            "accepted",
            "package",
            "description",
            "source_code",
        ]
        read_only_fields = [
            "id",
            "status",
            "logs",
            "episode",
            "team",
            "teamname",
            "user",
            "username",
            "created",
            "accepted",
        ]

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        ret.update(
            episode_id=self.context["episode_id"],
            team_id=self.context["team_id"],
            user_id=self.context["user_id"],
        )
        return ret

    def create(self, validated_data):
        validated_data.pop("source_code", None)
        return super().create(validated_data)


class SubmissionReportSerializer(serializers.Serializer):
    invocation = SaturnInvocationSerializer()
    accepted = serializers.BooleanField(required=False)

    @transaction.atomic
    def save(self):
        self.instance.status = self.validated_data["invocation"]["status"]
        self.instance.logs += self.validated_data["invocation"]["logs"]
        if self.validated_data.get("accepted", None) is not None:
            self.instance.accepted = self.validated_data["accepted"]
        self.instance.save(update_fields=["status", "logs", "accepted"])
        return self.instance


class MatchParticipantSerializer(serializers.ModelSerializer):
    teamname = serializers.CharField(source="team.name", read_only=True)
    rating = RatingField(read_only=True)
    old_rating = serializers.SerializerMethodField()

    class Meta:
        model = MatchParticipant
        fields = ["team", "teamname", "submission", "score", "rating", "old_rating"]
        read_only_fields = fields

    @extend_schema_field(OpenApiTypes.DOUBLE)
    def get_old_rating(self, obj):
        rating = obj.get_old_rating()
        if rating is None:
            # If unknown, use the team's current rating. The outside world just wants to
            # know our best estimate for the strength of their opponent. They don't want
            # a lecture about our deferred rating evaluation algorithm.
            rating = obj.team.profile.rating
        return RatingField().to_representation(rating)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Redact participation details depending on client identity
        if self.context["user_is_staff"]:
            # Staff can see everything
            pass
        elif all(
            member.pk != self.context["user_id"]
            for member in instance.team.members.all()
        ):
            # Non-staff users cannot see the active submission used by other teams
            data["submission"] = None
        return data


class MatchSerializer(serializers.ModelSerializer):
    red = MatchParticipantSerializer()
    blue = MatchParticipantSerializer()
    maps = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            "id",
            "status",
            "episode",
            "red",
            "blue",
            "maps",
            "alternate_color",
            "created",
            "is_ranked",
            "replay",
        ]
        read_only_fields = fields

    @extend_schema_field({"type": "array", "items": {"type": "string"}})
    def get_maps(self, obj):
        return [m.name for m in obj.maps.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Redact match details depending on client identity
        if self.context["user_is_staff"]:
            # Staff can see everything
            pass
        elif (
            instance.tournament_round is not None
            and not instance.tournament_round.is_released
        ):
            # Unreleased tournament matches are fully redacted
            data["red"] = data["blue"] = data["replay"] = data["maps"] = None
        elif any(
            member.pk == self.context["user_id"]
            for member in instance.red.team.members.all()
        ) or any(
            member.pk == self.context["user_id"]
            for member in instance.blue.team.members.all()
        ):
            # Clients can see everything about their own games
            pass
        elif (
            instance.red.team.status == TeamStatus.INVISIBLE
            or instance.blue.team.status == TeamStatus.INVISIBLE
        ):
            # Matches with invisible teams are fully redacted, because they are, by
            # definition, invisible
            data["red"] = data["blue"] = data["replay"] = data["maps"] = None
        elif instance.red.team.is_staff() or instance.blue.team.is_staff():
            # Matches with staff teams have scores redacted because they could be for
            # official grading purposes. We redact all of them just in case.
            data["red"]["score"] = data["blue"]["score"] = data["replay"] = None
        else:
            # Replay links are private, but scores are ok to be released.
            data["replay"] = None
        return data


class MatchReportSerializer(serializers.Serializer):
    invocation = SaturnInvocationSerializer()
    red_score = serializers.IntegerField(min_value=0)
    blue_score = serializers.IntegerField(min_value=0)

    def validate(self, data):
        has_red = data.get("red_score", None) is not None
        has_blue = data.get("blue_score", None) is not None
        if has_red + has_blue == 1:
            raise serializers.ValidationError("must provide either no or all scores")
        return data

    @transaction.atomic
    def save(self):
        self.instance.status = self.validated_data["invocation"]["status"]
        self.instance.logs += self.validated_data["invocation"]["logs"]
        if self.validated_data.get("red_score", None) is not None:
            self.instance.red.score = self.validated_data["red_score"]
            self.instance.red.save(update_fields=["score"])
        if self.validated_data.get("blue_score", None) is not None:
            self.instance.blue.score = self.validated_data["blue_score"]
            self.instance.blue.save(update_fields=["score"])
        self.instance.save(update_fields=["status", "logs"])
        return self.instance


class ScrimmageRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(
        source="requested_by.name", read_only=True
    )
    requested_by_rating = RatingField(
        source="requested_by.profile.rating", read_only=True
    )
    requested_to_name = serializers.CharField(
        source="requested_to.name", read_only=True
    )
    requested_to_rating = RatingField(
        source="requested_to.profile.rating", read_only=True
    )
    maps = serializers.SerializerMethodField()
    map_names = serializers.ListField(child=serializers.CharField(), write_only=True)

    class Meta:
        model = ScrimmageRequest
        fields = [
            "id",
            "episode",
            "created",
            "status",
            "is_ranked",
            "requested_by",
            "requested_by_name",
            "requested_by_rating",
            "requested_to",
            "requested_to_name",
            "requested_to_rating",
            "requester_color",
            "maps",
            "map_names",
        ]
        read_only_fields = [
            "id",
            "episode",
            "created",
            "status",
            "requested_by",
            "requested_by_name",
            "requested_to_name",
            "maps",
        ]

    @extend_schema_field({"type": "array", "items": {"type": "string"}})
    def get_maps(self, obj):
        return [m.name for m in obj.maps.all()]

    def validate(self, data):
        if data["is_ranked"] and self.context["team_is_staff"]:
            raise serializers.ValidationError("Staff can only have unranked matches")
        if data["is_ranked"] and data["requested_to"].is_staff():
            raise serializers.ValidationError("Matches against staff must be unranked")
        return data

    def validate_requested_to(self, value):
        if value.pk == self.context["team_id"]:
            raise serializers.ValidationError(
                "Cannot request scrimmage against yourself"
            )
        # Check opponent team is valid
        team_queryset = Team.objects.with_active_submission().filter(
            episode=self.context["episode_id"], pk=value.pk
        )
        if not self.context["team_is_staff"]:
            team_queryset = team_queryset.visible()
        if not team_queryset.exists():
            raise serializers.ValidationError("No valid opponent found")
        return value

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        maps = dict(
            Map.objects.filter(
                episode=self.context["episode_id"],
                is_public=True,
                name__in=data["map_names"],
            )
            .values_list("name", "pk")
            .all()
        )
        try:
            map_ids = [maps[name] for name in data["map_names"]]
        except KeyError:
            raise serializers.ValidationError(
                {
                    "The following maps were invalid": [
                        name for name in data["map_names"] if name not in maps
                    ]
                }
            )
        ret.update(
            episode_id=self.context["episode_id"],
            requested_by_id=self.context["team_id"],
            maps=map_ids,
        )
        ret.pop("map_names", None)
        return ret

    @transaction.atomic()
    def save(self, **kwargs):
        super().save(**kwargs)
