from rest_framework import serializers
from siarnaq.api.teams.models import Team, TeamProfile, TeamStatus, EligibilityCriterion, Rating
from django.contrib.auth import get_user_model

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


class TeamProfileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamProfile
        fields = [
            "quote",
            "biography",
            "has_avatar",
            "auto_accept_ranked",
            "auto_accept_unranked",
            "eligible_for",
        ]

class TeamWriteSerializer(serializers.ModelSerializer):
    profile = TeamProfileWriteSerializer(required=True)
    class Meta:
        model = Team
        fields = ["episode", "name", "members", "status", "profile"]

    def create(self, validated_data):
        profile_data = validated_data.pop("profile")
        members_data = validated_data.pop("members")
        team_obj = Team.objects.create(**validated_data)
        # add members separately bc we can't initialize a ManyToManyField on obj creation
        team_obj.members.add(*members_data)
        team_obj.save()

        eligible_for_data = profile_data.pop("eligible_for")
        # set rating to default rating
        rating_obj = Rating.objects.create()
        profile_obj = TeamProfile.objects.create(team=team_obj, rating=rating_obj, **profile_data)
        # add eligibility separately bc it's a ManyToManyField
        profile_obj.eligible_for.add(*eligible_for_data)
        profile_obj.save()
        return team_obj
    
    def update(self, instance, validated_data):
        # TODO implement this
        pass