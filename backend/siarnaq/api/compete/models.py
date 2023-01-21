import posixpath
import random
import uuid

import google.cloud.storage as storage
import google.cloud.tasks_v2 as tasks_v2
import structlog
from django.apps import apps
from django.conf import settings
from django.db import models
from django.urls import reverse
from sortedm2m.fields import SortedManyToManyField

import siarnaq.api.refs as refs
from siarnaq import bracket
from siarnaq.api.compete.managers import (
    MatchParticipantManager,
    MatchQuerySet,
    ScrimmageRequestQuerySet,
    SubmissionQuerySet,
)
from siarnaq.gcloud import tasks

logger = structlog.get_logger(__name__)


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

    created = models.DateTimeField(auto_now_add=True)
    """The time at which this object was created."""

    logs = models.TextField(blank=True)
    """The execution logs of the task invocation, if any."""

    num_failures = models.PositiveSmallIntegerField(default=0)
    """The number of times this invocation has failed."""

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

    accepted = models.BooleanField(default=False)
    """Whether this submission compiled successfully and has been accepted."""

    package = models.CharField(max_length=32, blank=True)
    """The package name in which the main entrypoint of the submission can be found."""

    description = models.CharField(max_length=128, blank=True)
    """A human-readable message describing the submission."""

    objects = SubmissionQuerySet.as_manager()

    def __str__(self):
        return f"#{self.pk}"

    def get_source_path(self):
        """Return the path of the source code on Google cloud storage."""
        return posixpath.join(
            "episode",
            self.episode.name_short,
            "submission",
            str(self.pk),
            "source.zip",
        )

    def get_binary_path(self):
        """Return the path of the binary code on Google cloud storage"""
        return posixpath.join(
            "episode",
            self.episode.name_short,
            "submission",
            str(self.pk),
            "binary.zip",
        )

    def for_saturn(self):
        """Return the representation of this object as expected by Saturn."""
        return {
            "source": {
                "bucket": settings.GCLOUD_BUCKET_SECURE,
                "name": self.get_source_path(),
            },
            "binary": {
                "bucket": settings.GCLOUD_BUCKET_SECURE,
                "name": self.get_binary_path(),
            },
            "team-name": self.team.name,
            "package": self.package,
        }

    def enqueue_options(self):
        """Return the options to be submitted to the compilation queue."""
        report_url = "https://{}{}".format(
            settings.ALLOWED_HOSTS[0],
            reverse(
                "submission-report",
                kwargs={"pk": self.pk, "episode_id": self.episode.pk},
            ),
        )
        return {
            "episode": self.episode.for_saturn(),
            "metadata": {
                "report-url": report_url,
                "task-type": "compile",
            },
            "details": self.for_saturn(),
        }


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

    maps = SortedManyToManyField(refs.MAP_MODEL, related_name="matches")
    """The maps to be played in this match."""

    alternate_order = models.BooleanField()
    """Whether players should alternate order between successive games of this match."""

    is_ranked = models.BooleanField()
    """Whether this match counts for ranked ratings."""

    replay = models.UUIDField(default=uuid.uuid4)
    """The replay file of this match."""

    bracket_id_private = models.IntegerField(blank=True, null=True, unique=True)
    """If this match is referenced in a private bracket service,
    the internal ID of the match in the bracket."""

    objects = MatchQuerySet.as_manager()

    def __str__(self):
        return (
            f"#{self.pk} ("
            + " \u2022 ".join(str(p) for p in self.participants.all())
            + ")"
        )

    def get_replay_path(self):
        """Return the path to the replay file."""
        return posixpath.join(
            "episode",
            self.episode.name_short,
            "replays",
            f"{self.replay}.{self.episode.name_short}",
        )

    def get_replay_url(self):
        """Return a URL to the replay file."""
        client = storage.Client.create_anonymous_client()
        return (
            client.bucket(settings.GCLOUD_BUCKET_SECURE)
            .blob(self.get_replay_path())
            .public_url
        )

    def for_saturn(self):
        """Return the representation of this object as expected by Saturn."""
        participants = {
            chr(ord("a") + p.player_index): p.submission.for_saturn()
            for p in self.participants.all()
        }
        return {
            "maps": [m.name for m in self.maps.all()],
            "replay": {
                "bucket": settings.GCLOUD_BUCKET_SECURE,
                "name": self.get_replay_path(),
            },
            "alternate-order": self.alternate_order,
            **participants,
        }

    def enqueue_options(self):
        """Return the options to be submitted to the execution queue."""
        report_url = "https://{}{}".format(
            settings.ALLOWED_HOSTS[0],
            reverse(
                "match-report",
                kwargs={"pk": self.pk, "episode_id": self.episode.pk},
            ),
        )
        return {
            "episode": self.episode.for_saturn(),
            "metadata": {
                "report-url": report_url,
                "task-type": "execute",
            },
            "details": self.for_saturn(),
        }

    def request_rating_update(self):
        """Request a match update to occur asynchronously."""
        tasks_client = tasks.get_task_client()
        parent = tasks_client.queue_path(
            settings.GCLOUD_PROJECT,
            settings.GCLOUD_LOCATION,
            settings.GCLOUD_RATING_QUEUE,
        )
        url = "https://{}{}".format(
            settings.ALLOWED_HOSTS[0],
            reverse(
                "match-rating-update",
                kwargs={"pk": self.pk, "episode_id": self.episode.pk},
            ),
        )
        task = tasks_v2.Task(
            http_request=tasks_v2.HttpRequest(
                http_method=tasks_v2.HttpMethod.POST,
                url=url,
                oidc_token=tasks_v2.OidcToken(
                    service_account_email=settings.GCLOUD_SERVICE_EMAIL,
                ),
            ),
        )
        logger.info(
            "rating_request",
            message="Requesting rating update for match.",
            match=self.pk,
        )
        tasks_client.create_task(request=dict(parent=parent, task=task))

    def try_rating_update(self):
        """
        Try to finalize the ratings of the participations if possible.

        This method runs sequentially; you should use request_rating_update to invoke
        this asynchronously instead.
        """
        log = logger.bind(match=self.pk)
        if self.is_ranked and not self.is_finalized():
            log.debug(
                "match_not_ready", message="Match ratings are not ready to finalize."
            )
            return

        participants = self.participants.all()
        for i, participant in enumerate(participants):
            participant.try_rating_update(
                opponents=[o for o in participants if o is not participant]
            )

    def report_to_bracket(self, is_private):
        """
        If a match is associated with a tournament bracket,
        update that tournament bracket.
        """

        bracket.update_match(self, is_private)


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

    match = models.ForeignKey(
        Match,
        on_delete=models.PROTECT,
        related_name="participants",
    )
    """The match to which this participant belongs."""

    player_index = models.PositiveSmallIntegerField()
    """The player number of the participant in the match."""

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

    bracket_id = models.CharField(null=True, blank=True, max_length=64)
    """A bracket service's internal ID of this participant, if any."""

    objects = MatchParticipantManager()

    def __str__(self):
        return str(self.team)

    def save(self, *args, **kwargs):
        """Pull the active submission and save to database."""
        if self._state.adding and self.submission_id is None:
            self.submission = self.team.get_active_submission()
        super().save(*args, **kwargs)

    def get_old_rating(self):
        """
        Retrieve the team's rating immediately prior to this participation, or None if
        unknown.
        """
        if self.previous_participation is not None:
            return self.previous_participation.rating  # Previous rating, if known
        else:
            return apps.get_model("teams", "Rating")()  # Default for first ever match

    def get_rating_delta(self):
        """
        Get the change in the rating mean of this participant, or null if it is not yet
        known.
        """
        if self.rating is None:
            return None
        return self.rating.value - self.get_old_rating().value

    def try_rating_update(self, *, opponents):
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
        finalized if the team's previous participation (if any) is already finalized,
        and if the match is either complete or unranked. After the update, any
        newly-finalizable participations are also finalized.

        Note that teams with no prior participations are assumed to have the
        default-constructed rating.

        Parameters
        ----------
        opponent : list[MatchParticipant]
            The opponent of this participation. Should be the return value of
            match.get_opponent(self)
        """
        log = logger.bind(match=self.match_id, team=self.team_id, participant=self.pk)
        if self.rating is not None:
            log.debug(
                "participant_noop", message="Participant rating is already finalized."
            )
            return

        old_rating = self.get_old_rating()
        if old_rating is None:
            log.debug(
                "participant_not_ready",
                message="Participant rating is not ready to finalize.",
            )
            return

        # Matches are unranked if they were supposed to be unranked, or if they ended
        # unsuccessfully.
        is_unranked = (not self.match.is_ranked) or (
            self.match.is_finalized() and self.match.status != SaturnStatus.COMPLETED
        )

        if is_unranked:
            if old_rating._state.adding:
                # If this is a default-constructed rating, save it to the database.
                # Occurs when this is the team's first-ever match.
                old_rating.save()
            self.rating = old_rating
            log.info(
                "participant_rating_unchanged",
                message="Participant rating is finalized and unchanged.",
            )

        elif self.match.is_finalized():
            opponent_ratings = [opponent.get_old_rating() for opponent in opponents]
            total_score = self.score + sum(opponent.score for opponent in opponents)
            if all(r is not None for r in opponent_ratings):
                self.rating = old_rating.step(
                    opponent_ratings, self.score / total_score
                )
                log.info(
                    "participant_rating_updated",
                    message="Participant rating is updated.",
                    old_rating=old_rating.value,
                    new_rating=self.rating.value,
                )
            else:
                log.debug(
                    "opponent_not_ready",
                    message="Opponent rating blocks participant from finalize.",
                )

        if self.rating is not None:
            self.save(update_fields=["rating"])
            # Finalize ratings for any matches that could now be ready
            try:
                next_match = Match.objects.prefetch_related(
                    "participants__previous_participation__rating",
                    "participants__rating",
                ).get(participants__previous_participation=self)
            except Match.DoesNotExist:
                pass  # No more matches to do
            else:
                next_match.request_rating_update()


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


class PlayerOrder(models.TextChoices):
    """
    An immutable type enumerating the possible player orders in a scrimmage request.
    """

    REQUESTER_FIRST = "+"
    REQUESTER_LAST = "-"
    SHUFFLED = "?"


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

    status = models.CharField(
        max_length=1,
        choices=ScrimmageRequestStatus.choices,
        default=ScrimmageRequestStatus.PENDING,
    )
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

    player_order = models.CharField(max_length=1, choices=PlayerOrder.choices)
    """The order of the players in the match."""

    maps = SortedManyToManyField(refs.MAP_MODEL, related_name="scrimmage_requests")
    """The maps to be played on the requested match."""

    objects = ScrimmageRequestQuerySet.as_manager()

    def __str__(self):
        return f"{self.requested_by} \u27F9 {self.requested_to}"

    def determine_is_alternating(self):
        """Determine whether the player order should be alternating."""
        return self.player_order == PlayerOrder.SHUFFLED

    def determine_order(self):
        """
        Determine the player order for the match. Not guaranteed to behave
        deterministically for random selections.
        """
        match (self.player_order, random.getrandbits(1)):
            case (PlayerOrder.REQUESTER_FIRST, _) | (PlayerOrder.SHUFFLED, 0):
                return [self.requested_by_id, self.requested_to_id]
            case (PlayerOrder.REQUESTER_LAST, _) | (PlayerOrder.SHUFFLED, 1):
                return [self.requested_to_id, self.requested_by_id]
            case _:
                raise ValueError("Unknown color")
