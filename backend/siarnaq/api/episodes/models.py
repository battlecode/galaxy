import random
import string

import structlog
from django.apps import apps
from django.db import models, transaction
from django.utils import timezone
from sortedm2m.fields import SortedManyToManyField

from siarnaq.api.compete.models import Match, MatchParticipant
from siarnaq.api.episodes import challonge
from siarnaq.api.episodes.managers import EpisodeQuerySet, TournamentQuerySet
from siarnaq.api.teams.models import Team

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

    title = models.CharField(max_length=128)
    """The title of this criterion."""

    description = models.TextField()
    """The description of this criterion."""

    icon = models.CharField(max_length=8)
    """An icon to display for teams that satisfy this criterion."""

    def __str__(self):
        return self.title


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

    scaffold = models.URLField(blank=True)
    """The URL of the git repository where the scaffold can be obtained."""

    artifact_name = models.CharField(max_length=32, blank=True)
    """The name of the artifact generated by deploy systems."""

    release_version_public = models.CharField(max_length=32, blank=True)
    """The code release available for public use."""

    release_version_saturn = models.CharField(max_length=32, blank=True)
    """The code release used by Saturn, which may differ from the public version."""

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
            episode=self,
            submission_freeze__lte=now,
            submission_unfreeze__gt=now,
            is_public=True,
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

    def for_saturn(self):
        """Return the representation of this object as expected by Saturn."""
        return {
            "name": self.name_short,
            "language": self.language,
            "scaffold": self.scaffold,
        }


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

    display_date = models.DateField()
    """
    The official date of the tournament; that is, when it will be streamed.
    """

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

    challonge_id_private = models.SlugField(null=True, blank=True)
    """The Challonge ID of the associated private bracket."""

    challonge_id_public = models.SlugField(null=True, blank=True)
    """The Challonge ID of the associated private bracket."""

    objects = TournamentQuerySet.as_manager()

    def __str__(self):
        return self.name_short

    def get_potential_participants(self):
        """Returns the list of participants that would be entered in this tournament,
        if it were to start right now."""
        # NOTE: this hasn't really been tested well.
        # Test all parts of eligibility filtering
        # (includes, excludes, resume)
        # Test also that special teams (eg devs) don't enter
        # Track in #549
        return (
            Team.objects.with_active_submission()
            .filter_eligible(self)
            .all()
            .order_by("-profile__rating__value")
        )

    def initialize(self):
        """
        Seed the tournament with eligible teams in order of decreasing rating,
        populate the Challonge brackets, and create TournamentRounds.
        """

        challonge_name_public = self.name_long
        challonge_name_private = challonge_name_public + " (private)"

        # For security by obfuscation,
        # and to allow easy regeneration of bracket,
        # create a random string to append to private bracket.
        # Note that name_short can be up to 32 chars
        # while challonge_id_private has a 50-char limit
        # (the default for SlugField).
        # "_priv" also takes some space too.
        # Thus be careful with length of key.
        key = "".join(
            random.choices(
                string.ascii_uppercase + string.ascii_lowercase + string.digits, k=12
            )
        )

        # Challonge does not allow hyphens in its IDs
        # so substitute them just in case
        challonge_id_public = f"{self.name_short}".replace("-", "_")
        challonge_id_private = f"{challonge_id_public}_{key}_priv".replace("-", "_")

        participants = self.get_potential_participants()
        # Parse into a format Challonge enjoys
        # 1-idx seed
        # Store team id in misc, for convenience (re-looking up is annoying)
        # Store tournament submission in misc, for consistency and convenience
        # Note that tournament submission should
        # never change during a tournament anyways
        # due to submission freeze. Bad things might happen if it does tho
        participants = [
            {"name": p.name, "seed": idx + 1, "misc": f"{p.id},{p.active_submission}"}
            for (idx, p) in enumerate(participants)
        ]

        # First bracket made should be private,
        # to hide results and enable fixing accidents
        challonge.create_tournament(
            challonge_id_private, challonge_name_private, True, self.style
        )
        challonge.bulk_add_participants(challonge_id_private, participants)
        challonge.start_tournament(challonge_id_private)

        round_indexes = challonge.get_round_indexes(challonge_id_private)

        # NOTE: rounds' order and indexes get weird in double elim.
        # Tracked in #548
        round_objects = [
            TournamentRound(
                tournament=self,
                challonge_id=round_index,
                name=f"{challonge_name_private} Round {round_index}",
            )
            for round_index in round_indexes
        ]

        with transaction.atomic():
            TournamentRound.objects.bulk_create(round_objects)
            self.challonge_id_private = challonge_id_private
            self.challonge_id_public = challonge_id_public
            self.save(update_fields=["challonge_id_private", "challonge_id_public"])

    def report_for_tournament(self, match):
        """
        If a match is associated with a tournament bracket,
        update that tournament bracket.
        """

        challonge.update_match(self.challonge_id_private, match.challonge_id, match)

    # Consider dropping these stubs, cuz they're bloat.
    # We're not confident whether or not the stubs might actually be used,
    # and someone can always remake them.
    # track in #549.
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

    # NOTE: this is not really an "ID" in the unique sense.
    # Instead it is more like an index.
    # (It takes on values of ints close to 0,
    # and two rounds from the same Challonge bracket
    # can have the same value here of course.)
    # You could rename this field, but that's a
    # very widespread code change and migration,
    # with low probability of success and
    # high impact of failure.
    challonge_id = models.SmallIntegerField(null=True, blank=True)
    """The ID of this round as referenced by Challonge."""

    name = models.CharField(max_length=64)
    """The name of this round in human-readable form, such as "Round 1"."""

    maps = SortedManyToManyField(Map, related_name="tournament_rounds", blank=True)
    """The maps to be used in this round."""

    release_status = models.IntegerField(
        choices=ReleaseStatus.choices, default=ReleaseStatus.HIDDEN
    )
    """THe degree to which matches in this round are released."""

    in_progress = models.BooleanField(default=False)
    """Whether the round is currently being run on the Saturn compute cluster."""

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tournament", "challonge_id"],
                name="round-unique-tournament-challonge",
            )
        ]

    def __str__(self):
        return f"{self.tournament} ({self.name})"

    def enqueue(self):
        """Creates and enqueues all matches for this round.
        Fails if this round is already in progress."""

        if self.in_progress:
            raise RuntimeError("The round's matches are already running in Saturn.")

        num_maps = len(self.maps.all())
        # Sure, matches with even number of maps won't run.
        # But might as well fail fast.
        if num_maps % 2 == 0:
            raise RuntimeError("The round does not have an odd number of maps.")

        tournament = challonge.get_tournament(self.tournament.challonge_id_private)
        # Derive matches of this round
        # NOTE this probably makes more sense (efficiency and consistency)
        # as a dict. Track in #549
        matches = []
        # Takes some wrangling with API response format
        # We should move this block later
        # (to keep all code that directly hits challonge
        # in its own module) Track in #549
        for item in tournament["included"]:
            # Much cleaner w match-case and multiple keys.
            # Track in #549
            if item["type"] == "match":
                round_idx = item["attributes"]["round"]
                if round_idx == self.challonge_id:
                    # Only enqueue the round if all matches are "open".
                    # NOTE: it would be good to have a "force re-enqueue round",
                    # which re-enqueues matches even if matches or round
                    # already in progress.
                    # This would change the following check --
                    # matches could be open _or done_.
                    # !!! This is also _really hard_ right now
                    # cuz it involves match deletion which is really hard.
                    # Track in #549
                    if item["attributes"]["state"] != "open":
                        # For later, have this raise a more specific exception.
                        # Then have the caller handle this return
                        # and translate it into an HTTP response.
                        raise RuntimeError(
                            "The bracket service's round does not only\
                                have matches that are ready."
                        )
                    matches.append(item)

        # Map participant "objects" with IDs for easy lookup
        participants = dict()
        for item in tournament["included"]:
            # Cleaner with match-case,
            # and would also allow for just one iteration over tournament, not 2.
            # Track in #549
            if item["type"] == "participant":
                id = item["id"]
                participants[id] = item

        match_objects = []
        maps_for_match_objects = []
        match_participant_objects = []

        for m in matches:
            match_object = Match(
                episode=self.tournament.episode,
                tournament_round=self,
                alternate_order=True,
                is_ranked=False,
                challonge_id=m["id"],
            )
            match_objects.append(match_object)

            # NOTE the following code is ridiculously inherent to challonge model.
            # Should probably get participants in away that's cleaner
            # tracked in #549
            # NOTE could prob wrap this in a for loop for partipant 1 and 2
            # tracked in #549
            p1_id = m["relationships"]["player1"]["data"]["id"]
            p1_misc_key = participants[p1_id]["attributes"]["misc"]
            team_id_1, submission_id_1 = (int(_) for _ in p1_misc_key.split(","))
            match_participant_1_object = MatchParticipant(
                team_id=team_id_1,
                submission_id=submission_id_1,
                match=match_object,
                # Note that player_index is 0-indexed.
                # This may be tricky if you optimize code in #549.
                player_index=0,
                challonge_id=p1_id,
            )
            match_participant_objects.append(match_participant_1_object)

            p2_id = m["relationships"]["player2"]["data"]["id"]
            p2_misc_key = participants[p2_id]["attributes"]["misc"]
            team_id_2, submission_id_2 = (int(_) for _ in p2_misc_key.split(","))
            match_participant_2_object = MatchParticipant(
                team_id=team_id_2,
                submission_id=submission_id_2,
                match=match_object,
                # Note that player_index is 0-indexed.
                # This may be tricky if you optimize code in #549.
                player_index=1,
                challonge_id=p2_id,
            )
            match_participant_objects.append(match_participant_2_object)

        with transaction.atomic():
            matches = Match.objects.bulk_create(match_objects)
            # Can only create these objects after matches are saved,
            # because beforehand, matches will not have a pk.
            maps_for_match_objects = [
                Match.maps.through(match_id=match.pk, map_id=map.pk)
                for match in matches
                for map in self.maps.all()
            ]
            Match.maps.through.objects.bulk_create(maps_for_match_objects)
            MatchParticipant.objects.bulk_create(match_participant_objects)

        Match.objects.filter(pk__in=[match.pk for match in matches]).enqueue()

        self.in_progress = True
        self.save(update_fields=["in_progress"])
