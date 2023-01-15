from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from siarnaq.api.episodes.models import (
    EligibilityCriterion,
    Episode,
    Map,
    ReleaseStatus,
    Tournament,
    TournamentRound,
)


class AutoscrimSerializer(serializers.Serializer):
    best_of = serializers.IntegerField(min_value=1)


class EligibilityCriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibilityCriterion
        fields = ["id", "title", "description", "icon"]
        read_only_fields = ["title", "description", "icon"]


class EpisodeSerializer(serializers.ModelSerializer):
    eligibility_criteria = EligibilityCriterionSerializer(many=True)
    frozen = serializers.SerializerMethodField()

    class Meta:
        model = Episode
        fields = [
            "name_short",
            "name_long",
            "blurb",
            "game_release",
            "language",
            "scaffold",
            "artifact_name",
            "release_version_public",
            "release_version_saturn",
            "eligibility_criteria",
            "frozen",
        ]

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_frozen(self, obj):
        return obj.frozen()


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ["id", "episode", "name", "is_public"]
        read_only_fields = ["episode", "name", "is_public"]


class TournamentSerializer(serializers.ModelSerializer):
    is_eligible = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            "name_short",
            "name_long",
            "blurb",
            "episode",
            "style",
            "display_date",
            "eligibility_includes",
            "eligibility_excludes",
            "require_resume",
            "is_public",
            "submission_freeze",
            "submission_unfreeze",
            "is_eligible",
        ]

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_eligible(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        return user.teams.filter_eligible(obj).exists()


class TournamentRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentRound
        fields = [
            "id",
            "tournament",
            "challonge_id",
            "name",
            "maps",
            "release_status",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Redact maps if not yet fully released
        if instance.release_status != ReleaseStatus.RESULTS:
            data["maps"] = None
        return data
