from rest_framework import serializers

from siarnaq.api.teams.models import Rating, Team, TeamProfile


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["episode", "name", "members", "status"]
        read_only_fields = ["members"]


class TeamProfileSerializer(serializers.ModelSerializer):
    team = TeamSerializer(required=True)

    class Meta:
        model = TeamProfile
        fields = [
            "team",
            "quote",
            "biography",
            "has_avatar",
            "auto_accept_ranked",
            "auto_accept_unranked",
            "eligible_for",
        ]

    def create(self, validated_data):
        eligible_for_exists = "eligible_for" in validated_data
        if eligible_for_exists:
            eligible_for_data = validated_data.pop("eligible_for")
        team_data = validated_data.pop("team")
        # set rating to default rating
        rating_obj = Rating.objects.create()
        team_obj = Team.objects.create(**team_data)
        profile_obj = TeamProfile.objects.create(
            team=team_obj, rating=rating_obj, **validated_data
        )
        # add eligibility separately
        if eligible_for_exists:
            profile_obj.eligible_for.add(*eligible_for_data)
        profile_obj.save()
        # add data to team
        request = self.context.get("request", None)
        team_obj.members.add(request.user)
        team_obj.save()
        return profile_obj

    def update(self, instance, validated_data):
        # get all data in instance
        instance.team = validated_data.get("team", instance.team)
        instance.quote = validated_data.get("quote", instance.quote)
        instance.biography = validated_data.get("biography", instance.biography)
        instance.has_avatar = validated_data.get("has_avatar", instance.has_avatar)
        instance.auto_accept_ranked = validated_data.get(
            "auto_accept_ranked", instance.auto_accept_ranked
        )
        instance.auto_accept_unranked = validated_data.get(
            "auto_accept_unranked", instance.auto_accept_unranked
        )
        instance.eligible_for.set(
            validated_data.get("eligible_for", instance.eligible_for).all()
        )
        instance.save()
        return instance
