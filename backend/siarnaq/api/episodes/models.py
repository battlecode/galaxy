from django.db import models

import siarnaq.api.refs as refs


class Language(models.TextChoices):
    """
    An immutable type enumerating the available languages.
    """

    JAVA_8 = "java8"
    PYTHON_3 = "py3"


class Episode(models.Model):
    """
    A database model for the information regarding an episode of Battlecode.
    """

    name_short = models.SlugField(max_length=16, primary_key=True)
    """Short unique identifying tag for the episode, e.g. bc22"""

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

    autoscrim_schedule = models.CharField(max_length=64, blank=True)
    """A cron specification for the autoscrim schedule."""

    language = models.CharField(max_length=8, choices=Language.choices)
    """The implementation language supported for this episode."""

    release_version = models.SlugField(max_length=32, blank=True)
    """The most up-to-date version of the episode code release."""

    pass_requirement_win = models.PositiveSmallIntegerField(blank=True)
    """
    The minimum number of matches to be won within a specified window in order to pass
    the Battlecode class.
    """

    pass_requirement_out_of = models.PositiveSmallIntegerField(blank=True)
    """
    The size of the window in which a minimum number of matches must be won in order to
    pass the Battlecode class.
    """

    # match_file_extension = models.CharField(max_length = 8)
    # """
    # The file extension of match files for this episode, e.g. "bc22".
    # """


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
        refs.ELIGIBILITY_CRITERION_MODEL,
        related_name="include_tournaments",
    )
    """
    The eligibility criteria that must be satisfied for a team to enter the tournament.
    """

    eligibility_excludes = models.ManyToManyField(
        refs.ELIGIBILITY_CRITERION_MODEL,
        related_name="exclude_tournaments",
    )
    """
    The eligibility criteria that must not be satisfied for a team to enter the
    tournament.
    """

    require_resume = models.BooleanField()
    """Whether teams must have submitted resumes in order to enter the tournament."""

    is_public = models.BooleanField()
    """Whether the results of the tournament are released and publicly available."""

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

    challonge_private = models.URLField()
    """A private Challonge bracket showing matches in progress as they are run."""

    challonge_public = models.URLField()
    """A public Challonge bracket showing match results as they are released."""

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

    challonge_id = models.SmallIntegerField()
    """The ID of this round as referenced by Challonge."""

    name = models.CharField(max_length=64)
    """The name of this round in human-readable form, such as "Round 1"."""

    maps = models.ManyToManyField(Map, related_name="tournament_rounds")
    """The maps to be used in this round."""

    is_released = models.BooleanField(default=False)
    """Whether the results of this round are released publicly."""

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tournament", "challonge_id"],
                name="round-unique-tournament-challonge",
            )
        ]
