import profile

from django.contrib.auth import get_user_model
from rest_framework import serializers

from siarnaq.api.teams.models import (
    EligibilityCriterion,
    Rating,
    Team,
    TeamProfile,
    TeamStatus,
)

# class BasicRatingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Rating
#         fields = [
#             'mean',
#             'updated'
#         ]

# class TeamProfileSerializer(serializers.ModelSerializer):
#     rating = BasicRatingSerializer(required=True)
#     class Meta:
#         model = TeamProfile
#         fields = [
#             "quote",
#             "biography",
#             "has_avatar",
#             "rating",
#             "auto_accept_ranked",
#             "auto_accept_unranked",
#             "eligible_for",
#         ]
#         read_only_fields = ["rating"]


# https://stackoverflow.com/a/45632937
# https://www.django-rest-framework.org/api-guide/relations/#writable-nested-serializers
# https://stackoverflow.com/questions/6996176/how-to-create-an-object-for-a-django-model-with-a-many-to-many-field
# https://www.django-rest-framework.org/api-guide/serializers/#writable-nested-representations
# https://www.cdrf.co/3.1/rest_framework.mixins/UpdateModelMixin.html
# https://www.cdrf.co/3.1/rest_framework.serializers/ModelSerializer.html
# https://www.django-rest-framework.org/api-guide/serializers/#serializer-inheritance

# class FullTeamSerializer(serializers.ModelSerializer):
#     profile = TeamProfileSerializer(required=True)
#     class Meta:
#         model = Team
#         fields = ["episode", "name", "members", "join_key", "status", "profile"]
#         read_only_fields = ["join_key"]

#     def create(self, validated_data):
#         profile_data = validated_data.pop("profile")
#         members_data = validated_data.pop("members")
#         team_obj = Team.objects.create(**validated_data)
#         team_obj.members.add(*members_data)
#         team_obj.save()
#         # print("members_data", *members_data)
#         # team.members.add(*members_data)
#         eligible_for_data = profile_data.pop("eligible_for")
#         rating_obj = Rating.objects.create()
#         profile_obj = TeamProfile.objects.create(team=team_obj, rating=rating_obj, **profile_data)
#         profile_obj.eligible_for.add(*eligible_for_data)
#         profile_obj.save()
#         return team_obj

#     def update(self, instance, validated_data):
#         pass

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["episode", "name", "members", "status"]

    def create(self, validated_data):
        members_data = validated_data.pop("members")
        team_obj = Team.objects.create(**validated_data)
        # add members separately bc we can't initialize a ManyToManyField on obj creation
        team_obj.members.add(*members_data)
        team_obj.save()
        return team_obj

    def update(self, instance, validated_data):
        # update all data in instance
        instance.name = validated_data.get("name", instance.name)
        instance.members = validated_data.get("members", instance.members)
        instance.status = validated_data.get("status", instance.status)
        # save changes
        instance.save()
        return instance

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
        eligible_for_data = validated_data.pop("eligible_for")
        team_data = validated_data.pop("team")
        # set rating to default rating
        rating_obj = Rating.objects.create()
        team_obj = Team.objects.create(**team_data)
        profile_obj = TeamProfile.objects.create(
            team=team_obj, rating=rating_obj, **validated_data
        )
        # add eligibility separately
        profile_obj.eligible_for.add(*eligible_for_data)
        profile_obj.save()
        return profile_obj

    def update(self, instance, validated_data):
        # update all data in instance
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
        instance.eligible_for = validated_data.get(
            "eligible_for", instance.eligible_for
        )
        instance.save()
        return instance