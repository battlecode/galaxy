"""
Names of models
"""

from django.conf import settings

USER_MODEL = settings.AUTH_USER_MODEL
EPISODE_MODEL = "episodes.Episode"
MAP_MODEL = "episodes.Map"
TOURNAMENT_ROUND_MODEL = "episodes.TournamentRound"

RATING_MODEL = "teams.Rating"
TEAM_MODEL = "teams.Team"

ELIGIBILITY_CRITERION_MODEL = "teams.EligibilityCriterion"
