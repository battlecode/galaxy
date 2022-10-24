import uuid

from django.apps import apps
from django.db import models
from django.db.models import Q

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
        return self.status in {
            SaturnStatus.COMPLETED,
            SaturnStatus.ERRORED,
            SaturnStatus.CANCELLED,
        }

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
        raise NotImplementedError


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
        blank=True,
    )
    """
    The active submission that was used by the team in this match. Will be auto-filled
    upon save if left blank.
    """

    score = models.PositiveSmallIntegerField(null=True, blank=True)
    """The team's score in the match, or null if the match has not been completed."""

    rating = models.ForeignKey(
        refs.RATING_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    """The team's rating after the match, or null if it is not yet known."""

    previous_participation = models.OneToOneField(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="next_participation",
    )
    """The team's previous participation, or null if there is none."""

    def save(self, *args, **kwargs):
        """Pull the active submission and save to database."""
        if self._state.adding:
            self.submission_id = self.team.get_active_submission_id()
        super().save(*args, **kwargs)

    def get_old_rating(self):
        """Retrieve the team's rating prior to this participation."""
        if self.previous_participation_id is not None:
            if self.previous_participation.rating_id is not None:
                return self.previous_participation.rating
            else:
                return None
        else:
            return apps.get_model("teams", "Rating")()

    def get_rating_delta(self):
        """
        Get the change in the rating mean of this participant, or null if it is not yet
        known.
        """
        if self.rating_id is None:
            return None
        return self.rating.to_value() - self.get_old_rating().to_value()

    def get_match(self):
        """Retrieve the match that contains this participation."""
        return Match.objects.get(Q(red=self) | Q(blue=self))

    def try_finalize_rating(self):
        """
        Attempt to finalize the rating for this participation if ready.

        Ratings are a complex affair. Ideally, we would like to update ratings as soon
        as we find out the result of a match. However, for user experience reasons,
        matches should have their ratings applied in the order they are listed to the
        client, which is in order of match creation (this ensures that matches do not
        spontaneously shuffle). This is usually different to the order of match
        completion.

        Therefore, we backlog rating updates when they come out of order, and finalize
        as many ratings as we can each time. A participation can have its rating
        finalized if the team's previous participation is already finalized, and if the
        match is either complete or unranked. After the update, any newly-finalizable
        participations are also finalized.
        """
        if self.rating_id is not None:
            return  # Done already!

        old_rating = self.get_old_rating()
        if old_rating is None:
            return  # Not ready

        match = self.get_match()
        opponent = match.get_opponent(self)

        # Matches are unranked if they were supposed to be unranked, or if they ended
        # unsuccessfully.
        is_unranked = (not match.is_ranked) or (
            match.is_finalized() and match.status != SaturnStatus.COMPLETED
        )

        if is_unranked:
            if old_rating._state.adding:
                old_rating.save()
            self.rating = old_rating
        elif match.is_finalized():
            opponent_rating = opponent.get_old_rating()
            if opponent_rating is not None:
                self.rating = self.get_old_rating().step(
                    opponent_rating, self.score / (self.score + opponent.score)
                )

        if self.rating is not None:
            self.save(update_fields=["rating"])
            # Finalize ratings for any participations that could now be ready
            opponent.try_finalize_rating()
            try:
                p = self.next_participation
            except MatchParticipant.DoesNotExist:
                pass  # No more participations to do
            else:
                p.try_finalize_rating()


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
        raise NotImplementedError

    def enqueue_options(self):
        """Return the options to be submitted to the execution queue."""
        raise NotImplementedError

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
        """Return the opponent participation of a given participation."""
        if self.red_id == team.id:
            return self.blue
        if self.blue_id == team.id:
            return self.red
        raise ValueError("team is not a participant in this match")


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
        raise NotImplementedError

    def is_requester_red_first(self):
        """
        Determine whether the requester will be red in the first game.
        Not guaranteed to behave deterministcally for random selections.
        """
        raise NotImplementedError

    def create_match(self):
        """Create and save a match object from this scrimmage request."""
        raise NotImplementedError
