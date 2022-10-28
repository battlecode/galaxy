from django.db import transaction
from rest_framework import serializers

from siarnaq.api.compete.models import SaturnStatus, Submission


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
