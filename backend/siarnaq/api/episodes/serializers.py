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
        fields = ["id", "question", "icon"]
        read_only_fields = ["question", "icon"]


class EpisodeSerializer(serializers.ModelSerializer):
    eligibility_criteria = EligibilityCriterionSerializer(many=True)

    class Meta:
        model = Episode
        fields = [
            "name_short",
            "name_long",
            "blurb",
            "game_release",
            "language",
            "release_version",
            "eligibility_criteria",
        ]


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ["id", "episode", "name", "is_public"]
        read_only_fields = ["episode", "name", "is_public"]


class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = [
            "name_short",
            "name_long",
            "blurb",
            "episode",
            "style",
            "eligibility_includes",
            "eligibility_excludes",
            "require_resume",
            "is_public",
            "submission_freeze",
            "submission_unfreeze",
            "challonge_public",
        ]


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
