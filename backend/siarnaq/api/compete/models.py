import uuid
import random

from django.db import models

import siarnaq.api.refs as refs
from siarnaq.api.compete.managers import (
    MatchQuerySet,
    ScrimmageRequestQuerySet,
    SubmissionQuerySet,
)


class SaturnStatus(models.TextChoices):
    """
    An immutable type enumerating the possible statuses of an invocation on Saturn.
    """

    CREATED = "NEW"
    """A record has been created but not yet added to a queue for invocation."""

    QUEUED = "QUE"
    """The invocation is in a queue waiting to be executed."""

    RUNNING = "RUN"
    """The invocation is currently being executed."""

    RETRY = "TRY"
    """The invocation failed and is in a queue to be retried."""

    COMPLETED = "OK!"
    """The invocation completed successfully."""

    ERRORED = "ERR"
    """The invocation failed and will no longer be retried."""

    CANCELLED = "CAN"
    """The invocation was cancelled by a client."""


class SaturnInvocation(models.Model):
    """
    A database model for a task to be run on Saturn.
    """

    status = models.CharField(
        max_length=3,
        choices=SaturnStatus.choices,
        default=SaturnStatus.CREATED,
    )
    """The current status of that task."""

    logs = models.TextField(blank=True)
    """The execution logs of the task invocation, if any."""

    class Meta:
        abstract = True

    def is_finalized(self):
        """Return whether this invocation is finalized."""
        pass

    def enqueue_options(self):
        """Return the options to be submitted to the saturn invocation queue."""
        raise NotImplementedError


class Submission(SaturnInvocation):
    """
    A database model for a submission made by a team, including data about its
    compilation status on Saturn.
    """

    episode = models.ForeignKey(
        refs.EPISODE_MODEL,
        on_delete=models.PROTECT,
        related_name="submissions",
    )
    """The competition episode to which this submission belongs."""

    team = models.ForeignKey(
        refs.TEAM_MODEL,
        on_delete=models.PROTECT,
        related_name="submissions",
    )
    """The team that made this submission."""

    user = models.ForeignKey(
        refs.USER_MODEL,
        on_delete=models.PROTECT,
        related_name="submissions",
    )
    """The user that made this submission."""

    created = models.DateTimeField(auto_now_add=True)
    """The time at which this submission was created."""

    accepted = models.BooleanField(default=False)
    """Whether this submission compiled successfully and has been accepted."""

    package = models.CharField(max_length=32, blank=True)
    """The package name in which the main entrypoint of the submission can be found."""

    description = models.CharField(max_length=128, blank=True)
    """A human-readable message describing the submission."""

    objects = SubmissionQuerySet.as_manager()

    def enqueue_options(self):
        """Return the options to be submitted to the compilation queue."""
        return {
            "id": self.pk,
            "episode": self.episode_id,
            "source": ...,  # TODO
            "binary": ...,
        }


class MatchParticipant(models.Model):
    """
    A database model for a participation of a team in a match.
    """

    team = models.ForeignKey(
        refs.TEAM_MODEL,
        on_delete=models.PROTECT,
        related_name="participations",
    )
    """The team participating in the match."""

    submission = models.ForeignKey(
        Submission,
        on_delete=models.PROTECT,
        related_name="participations",
    )
    """The active submission that was used by the team in this match."""

    score = models.PositiveSmallIntegerField(null=True, blank=True)
    """The team's score in the match, or null if the match has not been completed."""

    rating_old = models.OneToOneField(
        refs.RATING_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="succeeding_participation",
    )
    """The team's pre-match rating, or null if it depends on incomplete matches."""

    rating_new = models.OneToOneField(
        refs.RATING_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="preceding_participation",
    )
    """The team's post-match rating, or null if the match is rated and incomplete."""

    def get_rating_old(self):
        """
        Get the old rating of this participant, or else the participant's current rating
        if it is not yet known.
        """
        if self.rating_old is None:
            return self.team.profile.rating
        return self.rating_old

    def get_rating_new(self):
        """
        Get the new rating of this participant, or else None if it is not yet known.
        """
        return self.rating_new

    def get_rating_delta(self):
        """
        Get the change in the rating mean of this participant, or null if it is not yet
        known.
        """
        raise NotImplementedError


class Match(SaturnInvocation):
    """
    A database model for a match.
    """

    episode = models.ForeignKey(
        refs.EPISODE_MODEL,
        on_delete=models.PROTECT,
        related_name="matches",
    )
    """The episode to which this match belongs."""

    tournament_round = models.ForeignKey(
        refs.TOURNAMENT_ROUND_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="matches",
    )
    """The tournament round to which this match belongs, if any."""

    red = models.OneToOneField(
        MatchParticipant,
        on_delete=models.PROTECT,
        related_name="red_match",
    )
    """The red team on the first game in this match."""

    blue = models.OneToOneField(
        MatchParticipant,
        on_delete=models.PROTECT,
        related_name="blue_match",
    )
    """The blue team on the first game in this match."""

    maps = models.ManyToManyField(refs.MAP_MODEL, related_name="matches")
    """The maps to be played in this match."""

    alternate_color = models.BooleanField()
    """Whether teams should alternate colors between successive games of this match."""

    created = models.DateTimeField(auto_now_add=True)
    """The time at which this match was created."""

    is_ranked = models.BooleanField()
    """Whether this match counts for ranked ratings."""

    replay = models.UUIDField(default=uuid.uuid4)
    """The replay file of this match."""

    objects = MatchQuerySet.as_manager()

    def get_replay_path(self):
        """Return the path to the replay file."""
        # TODO: can we avoid dealing with extension
        # TODO: is the fact that path begins with "replays" going to hold
        #       for all episodes. and should it be included here anyway
        return f"replays/{self.replay}.{self.episode.name_short}"

    def enqueue_options(self):
        """Return the options to be submitted to the execution queue."""
        return {
            "id": self.pk,
            "episode": self.episode_id,
            "replay-path": self.get_replay_path(),
            "map": ",".join(map.name for map in self.maps), # TODO: correct format?
        }

    def can_see_teams(self, user):
        """Check whether a user is allowed to view the participants in this match."""
        if user.is_staff:
            # Staff members can see everything
            return True
        if self.tournament_round is not None:
            # Tournament matches are only available after release
            return self.tournament_round.is_released
        # Regular matches are public knowledge
        return True

    def can_see_outcome(self, user):
        """Check whether a user is allowed to view the outcome of this match."""
        if user.is_staff:
            # Staff members can see everything
            return True
        if self.tournament_round is not None:
            # Tournament matches are only available after release
            return self.tournament_round.is_released
        if user.is_authenticated:
            if user.teams.filter(pk__in={self.red.team, self.blue.team}).exists():
                # Team members can see outcomes of their own regular matches
                return True
        if self.red.team.is_staff() or self.blue.team.is_staff():
            # Matches with staff teams could expose student grades
            return False
        # Regular matches are public knowledge
        return True

    def get_opponent(self, team):
        """Return the opponent of a participant in this match."""
        if self.red.team.pk == team.pk:
            return self.blue.team
        if self.blue.team.pk == team.pk:
            return self.red.team
        raise ValueError("team is not a participant in this match")

    def finalize_ratings(self):
        """Populate the ratings for this match idempotently."""
        raise NotImplementedError


class ScrimmageRequestStatus(models.TextChoices):
    """
    An immutable type enumerating the possible statuses of a scrimmage request.
    """

    PENDING = "P"
    """The request was sent and is pending opponent acceptance."""

    ACCEPTED = "Y"
    """The request is accepted, and a corresponding match instance is generated."""

    REJECTED = "N"
    """The request was denied by the opponent."""

    CANCELLED = "X"
    """The request was cancelled by the sender."""


class PlayerColor(models.TextChoices):
    """
    An immutable type enumerating the possible player colors in a scrimmage request.
    """

    ALWAYS_RED = "RRR"
    ALWAYS_BLUE = "BBB"
    ALTERNATE_RED = "RBR"
    ALTERNATE_BLUE = "BRB"
    ALTERNATE_RANDOM = "???"  # Randomly selected from ALTERNATE_RED and ALTERNATE_BLUE


class ScrimmageRequest(models.Model):
    """
    A database model for a scrimmage request.
    """

    episode = models.ForeignKey(
        refs.EPISODE_MODEL,
        on_delete=models.PROTECT,
        related_name="scrimmage_requests",
    )
    """The episode to which this request belongs."""

    created = models.DateTimeField(auto_now_add=True)
    """The time at which this request was sent."""

    status = models.CharField(max_length=1, choices=ScrimmageRequestStatus.choices)
    """The status of this request."""

    is_ranked = models.BooleanField()
    """Whether this request is for a ranked match."""

    requested_by = models.ForeignKey(
        refs.TEAM_MODEL,
        on_delete=models.PROTECT,
        related_name="scrimmage_requests_sent",
    )
    """The sender who initiated this match request."""

    requested_to = models.ForeignKey(
        refs.TEAM_MODEL,
        on_delete=models.PROTECT,
        related_name="scrimmage_requests_received",
    )
    """The opponent who is receiving this match request."""

    color = models.CharField(max_length=3, choices=PlayerColor.choices)
    """
    The color requested by the sender.
    Note that the opponent will have the opposite color.
    """

    maps = models.ManyToManyField(refs.MAP_MODEL, related_name="scrimmage_requests")
    """The maps to be played on the requested match."""

    objects = ScrimmageRequestQuerySet.as_manager()

    def is_alternating_color(self):
        """Determine whether the requested color alternates between games."""
        return self.color in [PlayerColor.ALTERNATE_RED,
                              PlayerColor.ALTERNATE_BLUE,
                              PlayerColor.ALTERNATE_RANDOM]

    def is_requester_red_first(self):
        """
        Determine whether the requester will be red in the first game.
        Not guaranteed to behave deterministcally for random selections.
        """
        if self.color[1] == "R":
            return True
        elif self.color[1] == "B":
            return False
        else:
            return bool(random.randgetbits(1))

    def create_participant(self, team):
        """
        Create a match participant object for a team using
        the team's active submission.
        TODO: maybe should be a member function of Team
        """
        submission = team.get_active_submission()
        participant = MatchParticipant(team=team,
                                            submission=submission) # TODO: rating      
        return participant

    def create_match(self):
        """Create and save a match object from this scrimmage request."""
        red = self.create_participant(self.requested_by)
        blue = self.create_participant(self.requested_to)
        if not self.is_requester_red_first():
            red, blue = blue, red
        m = Match(epsiode=self.episode,
                     red=red,
                     blue=blue,
                     maps=self.maps,
                     alternate_color=self.is_alternating_color(),
                     is_ranked=self.is_ranked)
        m.save()
        Match.objects.filter(id=m.id).enqueue()     
        
