import random

import structlog
from django.conf import settings
from django.db import transaction
from django.template.defaultfilters import filesizeformat
from django.utils.deconstruct import deconstructible
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers, status
from rest_framework.exceptions import APIException

from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    PlayerOrder,
    SaturnStatus,
    ScrimmageRequest,
    Submission,
)
from siarnaq.api.episodes.models import Map, ReleaseStatus
from siarnaq.api.teams.models import Team, TeamStatus
from siarnaq.api.teams.serializers import RatingField

logger = structlog.get_logger(__name__)


class AlreadyFinalized(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "This invocation is already finalized."
    default_code = "already_finalized"


class SaturnInvocationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(SaturnStatus.choices)
    logs = serializers.CharField(
        required=False, allow_blank=True, trim_whitespace=False
    )
    interrupted = serializers.BooleanField(required=False)

    def update(self, instance, validated_data):
        log = logger.bind(
            id=instance.pk, type=type(instance), status=validated_data["status"]
        )
        if instance.is_finalized():
            log.warn("saturn_noop", message="Invocation is already finalized.")
            raise AlreadyFinalized
        instance.status = validated_data["status"]

        if logs := validated_data.get("logs", None):
            instance.logs += logs
        if instance.status == SaturnStatus.RETRY:
            if validated_data.get("interrupted", False):
                log.info("saturn_interrupted", message="Invocation was interrupted.")
            else:
                log.warn("saturn_failed", message="Invocation failed.")
                instance.num_failures += 1

        if instance.num_failures >= settings.SATURN_MAX_FAILURES:
            log.warn(
                "saturn_errored",
                message="Invocation errored with maximum retries reached.",
            )
            instance.status = SaturnStatus.ERRORED
            instance.logs += "[siarnaq] Maximum retries reached.\n"

        instance.save(update_fields=["status", "logs", "num_failures"])
        return instance


@deconstructible
class FileValidator:
    error_messages = {
        "max_size": (
            "Ensure this file size is not greater than %(max_size)s."
            " Your file size is %(size)s."
        ),
    }

    def __init__(self, max_size=None):
        self.max_size = max_size

    def __call__(self, data):

        if self.max_size is not None and data.size > self.max_size:
            params = {
                "max_size": filesizeformat(self.max_size),
                "size": filesizeformat(data.size),
            }
            raise serializers.ValidationError(self.error_messages["max_size"], params)

    def __eq__(self, other):
        return isinstance(other, FileValidator) and self.max_size == other.max_size


class SubmissionSerializer(serializers.ModelSerializer):
    teamname = serializers.CharField(source="team.name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    source_code = serializers.FileField(
        write_only=True, validators=[FileValidator(max_size=5 * 1024 * 1024)]
    )

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


class TournamentSubmissionSerializer(SubmissionSerializer):
    tournament = serializers.PrimaryKeyRelatedField(read_only=True)

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
            "tournament",
        ]
        read_only_fields = fields


class SubmissionDownloadSerializer(serializers.Serializer):
    ready = serializers.BooleanField(read_only=True)
    url = serializers.URLField(read_only=True)
    reason = serializers.CharField(read_only=True)


class SubmissionReportSerializer(serializers.Serializer):
    invocation = SaturnInvocationSerializer()
    accepted = serializers.BooleanField(required=False)

    @transaction.atomic
    def save(self):
        accepted = self.validated_data.get("accepted", None)
        if accepted is not None:
            self.instance.accepted = accepted
        self.instance.save(update_fields=["accepted"])

        invocation_serializer = self.fields["invocation"]
        invocation_serializer.update(self.instance, self.validated_data["invocation"])
        return self.instance


class MatchParticipantSerializer(serializers.ModelSerializer):
    teamname = serializers.CharField(source="team.name", read_only=True)
    rating = RatingField(read_only=True)
    old_rating = serializers.SerializerMethodField()

    class Meta:
        model = MatchParticipant
        fields = [
            "team",
            "teamname",
            "submission",
            "match",
            "player_index",
            "score",
            "rating",
            "old_rating",
        ]
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
    participants = MatchParticipantSerializer(many=True, allow_null=True)
    maps = serializers.SerializerMethodField(allow_null=True)
    replay_url = serializers.SerializerMethodField(allow_null=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "status",
            "episode",
            "tournament_round",
            "participants",
            "maps",
            "alternate_order",
            "created",
            "is_ranked",
            "replay_url",
        ]
        read_only_fields = fields

    @extend_schema_field({"type": "array", "items": {"type": "string"}})
    def get_maps(self, obj):
        return [m.name for m in obj.maps.all()]

    @extend_schema_field({"type": "string"})
    def get_replay_url(self, obj):
        return obj.get_replay_url()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Redact match details depending on client identity
        if self.context["user_is_staff"]:
            # Staff can see everything
            pass
        elif (
            (
                instance.tournament_round is not None
                and instance.tournament_round.release_status <= ReleaseStatus.HIDDEN
            )
            or (
                instance.tournament_round is not None
                and not instance.tournament_round.tournament.is_public
            )
            or instance.participants.filter(team__status=TeamStatus.INVISIBLE).exists()
        ):
            # Fully redact matches from private tournaments, unreleased tournament
            # rounds, and those with invisible teams.
            data["participants"] = data["replay_url"] = data["maps"] = None
        elif (
            instance.tournament_round is not None
            and instance.tournament_round.release_status <= ReleaseStatus.PARTICIPANTS
        ):
            # Participants-only tournament matches are partially redacted
            data["replay_url"] = data["maps"] = None
            for p in data["participants"]:
                p["score"] = None
        elif (
            instance.tournament_round is not None
            or instance.participants.filter(
                team__members=self.context["user_id"]
            ).exists()
        ):
            # Clients can see everything about their own games as well as released
            # tournament matches
            pass
        elif instance.participants.filter(team__status=TeamStatus.STAFF).exists():
            # Matches with staff teams have scores redacted because they could be for
            # official grading purposes. We redact all of them just in case.
            data["replay_url"] = None
            for p in data["participants"]:
                p["score"] = None
        else:
            # Replay links are private, but scores are ok to be released.
            data["replay_url"] = None
        return data


class MatchReportSerializer(serializers.Serializer):
    invocation = SaturnInvocationSerializer()
    scores = serializers.ListField(
        child=serializers.IntegerField(min_value=0), required=False
    )

    def validate(self, data):
        scores = data.get("scores", [])
        if scores and len(scores) != self.instance.participants.count():
            raise serializers.ValidationError("must provide either no or all scores")
        return data

    @transaction.atomic
    def save(self):
        participants = list(self.instance.participants.order_by("player_index"))
        scores = self.validated_data.get("scores", [])
        for participant, score in zip(participants, scores):
            participant.score = score
        MatchParticipant.objects.bulk_update(participants, ["score"])

        self.instance.refresh_from_db()
        invocation_serializer = self.fields["invocation"]
        invocation_serializer.update(self.instance, self.validated_data["invocation"])
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
    map_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        allow_empty=True,
        max_length=settings.MAX_MAPS_PER_SCRIMMAGE,
    )

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
            "player_order",
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
        if data["is_ranked"]:
            if self.context["team_is_staff"]:
                raise serializers.ValidationError(
                    "Staff can only have unranked matches"
                )
            if data["requested_to"].is_staff():
                raise serializers.ValidationError(
                    "Matches against staff must be unranked"
                )
            if data["player_order"] != PlayerOrder.SHUFFLED:
                raise serializers.ValidationError(
                    "Ranked matches must use shuffled order"
                )
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
            )
            .values_list("name", "pk")
            .all()
        )
        if ret["is_ranked"] and data["map_names"]:
            raise serializers.ValidationError({"map_names": "must be empty for ranked"})
        elif ret["is_ranked"]:
            # Ranked matches default to best-of-3.
            # One could make this configurable if they wish, along with autoscrims.
            data["map_names"] = random.sample(maps.keys(), 3)
        if not data["map_names"]:
            raise serializers.ValidationError({"map_names": "must not be empty"})
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

    @transaction.atomic
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class HistoricalRatingSerializer(serializers.Serializer):
    rating = RatingField()
    timestamp = serializers.DateTimeField()


class EmptySerializer(serializers.Serializer):
    pass
