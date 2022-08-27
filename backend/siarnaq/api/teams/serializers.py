from rest_framework import serializers
from siarnaq.api.teams.models import Team, TeamProfile, TeamStatus
from django.contrib.auth import get_user_model

class TeamProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamProfile
        fields = ['quote']#'__all__'

# https://stackoverflow.com/a/45632937
# https://www.django-rest-framework.org/api-guide/relations/#writable-nested-serializers 
# https://stackoverflow.com/questions/6996176/how-to-create-an-object-for-a-django-model-with-a-many-to-many-field
class TeamSerializer(serializers.ModelSerializer):
    team_profile = TeamProfileSerializer(required=True)
    members = serializers.SlugRelatedField(
        queryset=get_user_model().objects.all(), slug_field='username', many=True)
    
    class Meta:
        model = Team
        fields = ['episode', 'name', 'status', 'team_profile', 'members']

    # def is_valid(self):
    #     super().is_valid()


    def create(self, validated_data):
        print('vvalidated_data', validated_data)
        #members_data = validated_data.pop('team_members')
        profile_data = validated_data.pop('team_profile')
        members_data = validated_data.pop('members')
        team = Team.objects.create(**validated_data)
        print('members_data', *members_data)
        team.members.add(*members_data)
        team.save()
        print('ppprofile_data', profile_data)
        TeamProfile.objects.create(team=team.id, **profile_data)
        return team
    def update(self, instance, validated_data):
        pass