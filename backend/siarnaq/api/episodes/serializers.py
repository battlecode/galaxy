from rest_framework import serializers

from siarnaq.api.episodes.models import Episode, Tournament


class AutoscrimSerializer(serializers.Serializer):
    best_of = serializers.IntegerField(min_value=1)


class EpisodeSerializer(serializers.ModelSerializer):
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
