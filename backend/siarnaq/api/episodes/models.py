import structlog
from django.apps import apps
from django.db import models
from django.utils import timezone

from siarnaq.api.episodes.managers import EpisodeQuerySet, TournamentQuerySet

logger = structlog.get_logger(__name__)


class Language(models.TextChoices):
    """
    An immutable type enumerating the available languages.
    """

    JAVA_8 = "java8"
    PYTHON_3 = "py3"


class EligibilityCriterion(models.Model):
    """
    A database model for an eligibility criterion for entering into a tournament.
    """

    question = models.TextField()
    """The text question to be asked for this criterion."""

    description = models.TextField()
    """The description of this criterion."""

    icon = models.CharField(max_length=8)
    """An icon to display for teams that satisfy this criterion."""

    def __str__(self):
        return self.question


class Episode(models.Model):
    """
    A database model for the information regarding an episode of Battlecode.
    """

    name_short = models.SlugField(max_length=16, primary_key=True)
    """Short unique identifying tag for the episode."""

    name_long = models.CharField(max_length=128)
    """Full-form name for the episode."""

    blurb = models.TextField(blank=True)
    """A longer description of the episode."""

    registration = models.DateTimeField()
    """
    The time at which registration for the episode begins.
    Before this time, the episode is only visible to staff users.
    """

    game_release = models.DateTimeField()
    """
    The time at which the game specs are released.
    Before this time, the game specs are only visible to staff users.
    """

    game_archive = models.DateTimeField()
    """
    The time at which the episode is archived.
    After this time, no more ranked matches can be played.
    """

    submission_frozen = models.BooleanField(default=True)
    """
    Whether submissions are frozen.
    If true, only teams with staff privileges can make submisssions.
    """

    autoscrim_schedule = models.CharField(max_length=64, null=True, blank=True)
    """A cron specification for the autoscrim schedule, or null if disabled."""

    language = models.CharField(max_length=8, choices=Language.choices)
    """The implementation language supported for this episode."""

    release_version = models.CharField(max_length=32, blank=True)
    """The most up-to-date version of the episode code release."""

    eligibility_criteria = models.ManyToManyField(
        EligibilityCriterion, related_name="episodes", blank=True
    )
    """The eligibility criteria active in this episode."""

    pass_requirement_win = models.PositiveSmallIntegerField(null=True, blank=True)
    """
    The minimum number of matches to be won within a specified window in order to pass
    the Battlecode class.
    """

    pass_requirement_out_of = models.PositiveSmallIntegerField(null=True, blank=True)
    """
    The size of the window in which a minimum number of matches must be won in order to
    pass the Battlecode class.
    """

    objects = EpisodeQuerySet.as_manager()

    def __str__(self):
        return self.name_short

    def frozen(self):
        """Return whether the episode is currently frozen to submissions."""
        now = timezone.now()
        if self.submission_frozen or now < self.game_release:
            return True
        return Tournament.objects.filter(
            episode=self, submission_freeze__lte=now, submission_unfreeze__gt=now
        ).exists()

    def autoscrim(self, best_of):
        """
        Trigger a round of automatically-generated ranked scrimmages for all teams in
        this episode with an accepted submission, unless the episode is archived or
        frozen.

        Parameters
        ----------
        best_of : int
            The number of maps to be played in each match, must be no greater than the
            number of maps available for the episode.
        """
        log = logger.bind(episode=self.pk)
        if self.frozen():
            log.warn("autoscrim_frozen", message="Refusing to autoscrim: frozen.")
            return
        if timezone.now() > self.game_archive:
            log.warn("autoscrim_archived", message="Refusing to autoscrim: archived.")
        apps.get_model("teams", "Team").objects.autoscrim(episode=self, best_of=best_of)


class Map(models.Model):
    """
    A database model for the information regarding a game map in an episode.
    """

    episode = models.ForeignKey(Episode, on_delete=models.CASCADE, related_name="maps")
    """The episode to which this map belongs."""

    name = models.SlugField(max_length=24)
    """The name of the map."""

    is_public = models.BooleanField(default=False)
    """
    Whether the map is publicly accessible.
    If false, only teams with staff privileges can use the map.
    """

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["episode", "name"],
                name="map-unique-episode-name",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.episode})"


class TournamentStyle(models.TextChoices):
    """
    An immutable type enumerating the available styles of tournament.
    """

    SINGLE_ELIMINATION = "SE"
    DOUBLE_ELIMINATION = "DE"


class Tournament(models.Model):
    """
    A database model for the information regarding a tournament in an episode.
    """

    name_short = models.SlugField(max_length=32, primary_key=True)
    """Short unique identifying tag for the tournament."""

    name_long = models.CharField(max_length=128)
    """Full-form name for the tournament."""

    blurb = models.TextField(blank=True)
    """A longer description of the tournament."""

    episode = models.ForeignKey(
        Episode,
        on_delete=models.PROTECT,
        related_name="tournaments",
    )
    """The episode to which this tournament belongs."""

    style = models.CharField(max_length=2, choices=TournamentStyle.choices)
    """The style of this tournament."""

    eligibility_includes = models.ManyToManyField(
        EligibilityCriterion,
        related_name="include_tournaments",
        blank=True,
    )
    """
    The eligibility criteria that must be satisfied for a team to enter the tournament.
    """

    eligibility_excludes = models.ManyToManyField(
        EligibilityCriterion,
        related_name="exclude_tournaments",
        blank=True,
    )
    """
    The eligibility criteria that must not be satisfied for a team to enter the
    tournament.
    """

    require_resume = models.BooleanField()
    """Whether teams must have submitted resumes in order to enter the tournament."""

    is_public = models.BooleanField()
    """Whether this tournament is included in the public index."""

    submission_freeze = models.DateTimeField()
    """
    The time at which submissions are frozen for the tournament.
    Between this time and the unfreeze time, only staff members are able to submit.
    """

    submission_unfreeze = models.DateTimeField()
    """
    The time at which submissions are unfrozen for the tournament.
    Between the freeze time and this time, only staff members are able to submit.
    The submissions to enter into this tournament are the latest ones accepted by this
    time.
    """

    in_progress = models.BooleanField(default=False)
    """Whether the tournament is currently being run on the Saturn compute cluster."""

    challonge_private = models.URLField(null=True, blank=True)
    """A private Challonge bracket showing matches in progress as they are run."""

    challonge_public = models.URLField(null=True, blank=True)
    """A public Challonge bracket showing match results as they are released."""

    objects = TournamentQuerySet.as_manager()

    def __str__(self):
        return self.name_short

    def seed_by_scrimmage(self):
        """
        Seed the tournament with eligible teamsn in order of decreasing rating, and
        populate the Challonge brackets.
        """
        raise NotImplementedError

    def start_progress(self):
        """Start or resume the tournament."""
        raise NotImplementedError

    def stop_progress(self):
        """Pause the tournament."""
        raise NotImplementedError

    def enqueue_open_matches(self):
        """Find matches that are waiting to be run, and run them."""
        raise NotImplementedError


class ReleaseStatus(models.IntegerChoices):
    """
    An immutable type enumerating the degree to which the results of a tournament match
    are released. Greater values indicate greater visibility.
    """

    HIDDEN = 0
    PARTICIPANTS = 1
    RESULTS = 2


class TournamentRound(models.Model):
    """
    A database model for the information regarding a round of a tournament. A round is
    defined as a parallel set of matches; for example, "Round 1", or the semi-finals.
    """

    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.PROTECT,
        related_name="rounds",
    )
    """The tournament to which this round belongs."""

    challonge_id = models.SmallIntegerField(null=True, blank=True)
    """The ID of this round as referenced by Challonge."""

    name = models.CharField(max_length=64)
    """The name of this round in human-readable form, such as "Round 1"."""

    maps = models.ManyToManyField(Map, related_name="tournament_rounds", blank=True)
    """The maps to be used in this round."""

    release_status = models.IntegerField(
        choices=ReleaseStatus.choices, default=ReleaseStatus.HIDDEN
    )
    """THe degree to which matches in this round are released."""

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tournament", "challonge_id"],
                name="round-unique-tournament-challonge",
            )
        ]

    def __str__(self):
        return f"{self.tournament} ({self.name})"
