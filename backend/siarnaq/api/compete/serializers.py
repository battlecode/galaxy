from django.db import transaction
from rest_framework import serializers

from siarnaq.api.compete.models import Match, MatchParticipant, SaturnStatus, Submission


class SaturnInvocationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(SaturnStatus.choices)
    logs = serializers.CharField(required=False)


class SubmissionSerializer(serializers.ModelSerializer):
    source_code = serializers.FileField(write_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "status",
            "logs",
            "episode",
            "team",
            "user",
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
            "user",
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
    class Meta:
        model = MatchParticipant
        fields = ["team", "submission", "score", "rating"]
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Redact participation details depending on client identity
        if self.context["is_staff"]:
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

    class Meta:
        model = Match
        fields = [
            "id",
            "status",
            "logs",
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Redact match details depending on client identity
        if self.context["is_staff"]:
            # Staff can see everything
            pass
        elif (
            instance.tournament_round is not None
            and not instance.tournament_round.is_released
        ):
            # Unreleased tournament matches are fully redacted
            data["logs"] = ""
            data["red"] = None
            data["blue"] = None
            data["replay"] = None
            data["maps"] = None
        elif any(
            member.pk == self.context["user_id"]
            for member in instance.red.team.members.all()
        ) or any(
            member.pk == self.context["user_id"]
            for member in instance.blue.team.members.all()
        ):
            # Clients can see everything about their own games
            pass
        elif instance.red.team.is_staff() or instance.blue.team.is_staff():
            # Matches with staff teams have scores redacted because they could be for
            # official grading purposes. We redact all of them just in case.
            data["logs"] = ""
            data["red"]["score"] = None
            data["blue"]["score"] = None
            data["replay"] = None
        else:
            # Replay links are private, but scores are ok to be released.
            data["replay"] = None
        return data
