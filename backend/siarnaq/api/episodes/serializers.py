from rest_framework import serializers

from siarnaq.api.episodes.models import Episode


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
