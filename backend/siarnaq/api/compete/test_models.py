from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    PlayerOrder,
    SaturnStatus,
    ScrimmageRequest,
    Submission,
)
from siarnaq.api.episodes.models import Episode, Language, Map
from siarnaq.api.teams.models import Rating, Team, TeamProfile
from siarnaq.api.user.models import User


class MatchParticipantLinkedListTestCase(TestCase):
    """Test suite for the linked list structure of the MatchParticipant model."""

    def setUp(self):
        """Initialize the episode and teams available in the test suite."""
        self.e1 = Episode.objects.create(
            name_short="e1",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            language=Language.JAVA_8,
        )
        for name in ["team1", "team2", "team3"]:
            t = Team.objects.create(episode=self.e1, name=name)
            TeamProfile.objects.create(team=t, rating=Rating.objects.create())
            Submission.objects.create(
                episode=self.e1,
                team=t,
                user=User.objects.create_user(
                    username=name + "_user", email=f"{name}@example.com"
                ),
                accepted=True,
            )

    def make_match(self):
        return Match.objects.create(
            episode=self.e1, alternate_order=False, is_ranked=False
        )

    # Partitions for: single creation.
    # - team only has 1 participation
    # - team has more than 1 participation

    def test_individual_create_single_element(self):
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        p1 = MatchParticipant.objects.create(
            team=t1, match=self.make_match(), player_index=0
        )
        p2 = MatchParticipant.objects.create(
            team=t2, match=self.make_match(), player_index=0
        )
        p3 = MatchParticipant.objects.create(
            team=t3, match=self.make_match(), player_index=0
        )
        for p in [p1, p2, p3]:
            self.assertIsNone(p.previous_participation)
            self.assertFalse(hasattr(p, "next_participation"))

    def test_individual_create_multiple_element(self):
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        p1 = MatchParticipant.objects.create(
            team=t1, match=self.make_match(), player_index=0
        )
        p2 = MatchParticipant.objects.create(
            team=t2, match=self.make_match(), player_index=0
        )
        p3 = MatchParticipant.objects.create(
            team=t1, match=self.make_match(), player_index=0
        )

        self.assertIsNone(p1.previous_participation)
        self.assertEqual(p1.next_participation, p3)
        self.assertIsNone(p2.previous_participation)
        self.assertFalse(hasattr(p2, "next_participation"))
        self.assertEqual(p3.previous_participation, p1)
        self.assertFalse(hasattr(p3, "next_participation"))

    # Partitions for: bulk creation.
    # - team bulk-created participations: single, multiple
    # - team existing participations: exists, does not exist

    def test_bulk_create_participation_single_previous_none(self):
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        s1 = Submission.objects.get(team=t1)
        s2 = Submission.objects.get(team=t2)
        s3 = Submission.objects.get(team=t3)
        MatchParticipant.objects.bulk_create(
            [
                MatchParticipant(
                    team=t1, match=self.make_match(), player_index=0, submission=s1
                ),
                MatchParticipant(
                    team=t2, match=self.make_match(), player_index=0, submission=s2
                ),
                MatchParticipant(
                    team=t3, match=self.make_match(), player_index=0, submission=s3
                ),
            ]
        )
        self.assertFalse(
            MatchParticipant.objects.filter(
                previous_participation__isnull=False
            ).exists()
        )

    def test_bulk_create_participation_multiple_previous_exists(self):
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        s1 = Submission.objects.get(team=t1)
        s2 = Submission.objects.get(team=t2)
        s3 = Submission.objects.get(team=t3)
        MatchParticipant.objects.bulk_create(
            [
                MatchParticipant(
                    team=t1, match=self.make_match(), player_index=0, submission=s1
                ),
                MatchParticipant(
                    team=t2, match=self.make_match(), player_index=0, submission=s2
                ),
                MatchParticipant(
                    team=t3, match=self.make_match(), player_index=0, submission=s3
                ),
            ]
        )
        objs = MatchParticipant.objects.bulk_create(
            [
                MatchParticipant(
                    team=t1, match=self.make_match(), player_index=0, submission=s1
                ),
                MatchParticipant(
                    team=t2, match=self.make_match(), player_index=0, submission=s2
                ),
                MatchParticipant(
                    team=t3, match=self.make_match(), player_index=0, submission=s3
                ),
            ]
        )
        for obj in objs:
            obj.refresh_from_db()
            self.assertEqual(obj.team, obj.previous_participation.team)
            self.assertIsNone(obj.previous_participation.previous_participation)


class MatchParticipantRatingFinalizationTestCase(TestCase):
    """Test suite for the delayed rating finalization algorithm."""

    def setUp(self):
        """Initialize the episode and teams available in the test suite."""
        e1 = Episode.objects.create(
            name_short="e1",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            language=Language.JAVA_8,
        )
        for name in ["team1", "team2", "team3"]:
            t = Team.objects.create(episode=e1, name=name)
            TeamProfile.objects.create(team=t, rating=Rating.objects.create())
            Submission.objects.create(
                episode=e1,
                team=t,
                user=User.objects.create_user(
                    username=name + "_user", email=f"{name}@example.com"
                ),
                accepted=True,
            )

    # Partitions for: rating. Testing finalizations occur iff prerequisites are met.
    # - match type: ranked, unranked
    # - match status: completed successfully, failed, in progress
    # - previous participation status: finalized, not finalized, does not exist

    def test_finalize_ranked_completed_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        MatchParticipant.objects.create(
            team=t1, match=m1, player_index=0, score=1, rating=r1
        )
        MatchParticipant.objects.create(
            team=t2, match=m1, player_index=1, score=0, rating=r2
        )
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        red = MatchParticipant.objects.create(
            team=t1, match=m2, player_index=0, score=1
        )
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1, score=0)

        m2.status = SaturnStatus.COMPLETED
        m2.save()
        red.refresh_from_db()
        # Expect rating increase after win
        self.assertIsNotNone(red.rating)
        self.assertGreater(red.rating.mean, red.get_old_rating().mean)
        self.assertEqual(red.rating.n, r1.n + 1)
        self.assertEqual(t1.profile.rating, red.rating)

    def test_finalize_ranked_completed_previous_not_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        MatchParticipant.objects.create(team=t1, match=m1, player_index=0)
        MatchParticipant.objects.create(team=t2, match=m1, player_index=1)
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        red = MatchParticipant.objects.create(
            team=t1, match=m2, player_index=0, score=1
        )
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1, score=0)

        m2.status = SaturnStatus.COMPLETED
        m2.save()
        red.refresh_from_db()
        # Expect no rating because previous not ready
        self.assertIsNone(red.rating)

    def test_finalize_ranked_completed_previous_nonexistent(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        red = MatchParticipant.objects.create(
            team=t1, match=m1, player_index=0, score=1
        )
        MatchParticipant.objects.create(team=t2, match=m1, player_index=1, score=0)

        m1.status = SaturnStatus.COMPLETED
        m1.save()
        red.refresh_from_db()
        # Expect rating increase after win
        self.assertIsNotNone(red.rating)
        self.assertGreater(red.rating.mean, red.get_old_rating().mean)
        self.assertEqual(red.rating.n, 1)
        self.assertEqual(t1.profile.rating, red.rating)

    def test_finalize_ranked_failed_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        red1 = MatchParticipant.objects.create(
            team=t1, match=m1, player_index=0, score=1, rating=r1
        )
        MatchParticipant.objects.create(
            team=t2, match=m1, player_index=1, score=0, rating=r2
        )
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        red2 = MatchParticipant.objects.create(team=t1, match=m2, player_index=0)
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1)

        m2.status = SaturnStatus.ERRORED
        m2.save()
        red1.refresh_from_db()
        red2.refresh_from_db()
        # Expect no change because no result
        self.assertEqual(red1.rating, red2.rating)

    def test_finalize_ranked_failed_previous_not_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        MatchParticipant.objects.create(team=t1, match=m1, player_index=0)
        MatchParticipant.objects.create(team=t2, match=m1, player_index=1)
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        red = MatchParticipant.objects.create(team=t1, match=m2, player_index=0)
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1)

        m2.status = SaturnStatus.ERRORED
        m2.save()
        red.refresh_from_db()
        # Expect no rating because previous not ready
        self.assertIsNone(red.rating)

    def test_finalize_ranked_inprogress_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        MatchParticipant.objects.create(
            team=t1, match=m1, player_index=0, score=1, rating=r1
        )
        MatchParticipant.objects.create(
            team=t2, match=m1, player_index=1, score=0, rating=r2
        )
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.CREATED,
        )
        red = MatchParticipant.objects.create(team=t1, match=m2, player_index=0)
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1)

        m2.status = SaturnStatus.RUNNING
        m2.save()
        red.refresh_from_db()
        # Expect no rating because no result
        self.assertIsNone(red.rating)

    def test_finalize_unranked_completed_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        red1 = MatchParticipant.objects.create(
            team=t1, match=m1, player_index=0, score=1, rating=r1
        )
        MatchParticipant.objects.create(
            team=t2, match=m1, player_index=1, score=0, rating=r2
        )
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=False,
            status=SaturnStatus.RUNNING,
        )
        red2 = MatchParticipant.objects.create(
            team=t1, match=m2, player_index=0, score=1
        )
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1, score=0)

        m2.status = SaturnStatus.COMPLETED
        m2.save()
        red1.refresh_from_db()
        red2.refresh_from_db()
        # Expect no change because unranked
        self.assertEqual(red1.rating, red2.rating)
        self.assertEqual(t1.profile.rating, red2.rating)

    def test_finalize_unranked_completed_previous_not_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        MatchParticipant.objects.create(team=t1, match=m1, player_index=0)
        MatchParticipant.objects.create(team=t2, match=m1, player_index=1)
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=False,
            status=SaturnStatus.RUNNING,
        )
        red = MatchParticipant.objects.create(
            team=t1, match=m2, player_index=0, score=1
        )
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1, score=0)

        m2.status = SaturnStatus.COMPLETED
        m2.save()
        red.refresh_from_db()
        # Expect no rating because previous not ready
        self.assertIsNone(red.rating)

    def test_finalize_unranked_completed_previous_nonexistent(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=False,
            status=SaturnStatus.RUNNING,
        )
        red = MatchParticipant.objects.create(
            team=t1, match=m1, player_index=0, score=1
        )
        MatchParticipant.objects.create(team=t2, match=m1, player_index=1, score=0)

        m1.status = SaturnStatus.COMPLETED
        m1.save()
        red.refresh_from_db()
        # Expect no change because unranked
        self.assertIsNotNone(red.rating)
        self.assertEqual(red.rating.value, red.get_old_rating().value)
        self.assertEqual(red.rating.n, 0)
        self.assertEqual(t1.profile.rating.value, red.rating.value)

    # Partitions for: finalize chaining. Testing finalizations propagate correctly.
    # - chain has finalized opponent
    # - chain has unfinalized opponent

    def test_chain_opponent_unfinalized(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        red1 = MatchParticipant.objects.create(team=t1, match=m1, player_index=0)
        blue1 = MatchParticipant.objects.create(team=t2, match=m1, player_index=1)
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        MatchParticipant.objects.create(team=t2, match=m2, player_index=0)
        MatchParticipant.objects.create(team=t3, match=m2, player_index=1)
        m3 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        red3 = MatchParticipant.objects.create(
            team=t1, match=m3, player_index=0, score=1
        )
        blue3 = MatchParticipant.objects.create(
            team=t3, match=m3, player_index=1, score=0
        )

        m1.status, red1.score, blue1.score = SaturnStatus.COMPLETED, 1, 0
        red1.save()
        blue1.save()
        m1.save()
        red1.refresh_from_db()
        red3.refresh_from_db()
        blue3.refresh_from_db()
        # Expect m3 red to not be finalized yet, because t3 is not finalized
        self.assertIsNotNone(red1.rating)
        self.assertGreater(red1.rating.mean, red1.get_old_rating().mean)
        self.assertEqual(red1.rating.n, 1)
        self.assertEqual(t1.profile.rating, red1.rating)
        self.assertIsNone(red3.rating)
        self.assertIsNone(blue3.rating)

    def test_chain_opponent_finalized(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        red1 = MatchParticipant.objects.create(team=t1, match=m1, player_index=0)
        blue1 = MatchParticipant.objects.create(team=t2, match=m1, player_index=1)
        m2 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        MatchParticipant.objects.create(
            team=t2, match=m2, player_index=0, score=1, rating=r1
        )
        MatchParticipant.objects.create(
            team=t3, match=m2, player_index=1, score=0, rating=r2
        )
        m3 = Match.objects.create(
            episode=e1,
            alternate_order=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        red3 = MatchParticipant.objects.create(
            team=t1, match=m3, player_index=0, score=1
        )
        blue3 = MatchParticipant.objects.create(
            team=t3, match=m3, player_index=1, score=0
        )

        m1.status, red1.score, blue1.score = SaturnStatus.COMPLETED, 1, 0
        red1.save()
        blue1.save()
        m1.save()
        red3.refresh_from_db()
        blue3.refresh_from_db()
        # Expect m3 red and blue to be both finalized
        self.assertIsNotNone(red3.rating)
        self.assertGreater(red3.rating.mean, red3.get_old_rating().mean)
        self.assertEqual(red3.rating.n, 2)
        self.assertIsNotNone(blue3.rating)
        self.assertLess(blue3.rating.mean, blue3.get_old_rating().mean)
        self.assertEqual(blue3.rating.n, r2.n + 1)


class ScrimmageRequestQuerySetTestCase(TestCase):
    """Test suite for handling sets of scrimmage requests."""

    def setUp(self):
        e1 = Episode.objects.create(
            name_short="e1",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            language=Language.JAVA_8,
        )
        self.m = Map.objects.create(episode=e1, name="m", is_public=True)
        self.teams = []
        for name in ["team1", "team2"]:
            t = Team.objects.create(episode=e1, name=name)
            TeamProfile.objects.create(team=t, rating=Rating.objects.create())
            Submission.objects.create(
                episode=e1,
                team=t,
                user=User.objects.create_user(
                    username=name + "_user", email=f"{name}@example.com"
                ),
                accepted=True,
            )
            self.teams.append(t)
        self.n = 100
        for i in range(self.n):
            r = ScrimmageRequest.objects.create(
                episode=e1,
                is_ranked=True,
                requested_by=self.teams[0],
                requested_to=self.teams[1],
                player_order=PlayerOrder.SHUFFLED,
            )
            r.maps.add(self.m)

    # Partitions for: accept
    # player order: requester first, requester last, shuffled

    @patch(
        "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue", autospec=True
    )
    def test_accept_requester_first(self, enqueue):
        ScrimmageRequest.objects.update(player_order=PlayerOrder.REQUESTER_FIRST)
        ScrimmageRequest.objects.accept()
        self.assertEqual(Match.objects.count(), self.n)
        self.assertEqual(Map.objects.get().scrimmage_requests.count(), self.n)
        self.assertEqual(
            MatchParticipant.objects.filter(team=self.teams[0], player_index=0).count(),
            self.n,
        )
        self.assertEqual(
            MatchParticipant.objects.filter(team=self.teams[1], player_index=1).count(),
            self.n,
        )
        self.assertEqual(Match.objects.filter(alternate_order=False).count(), self.n)

    @patch(
        "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue", autospec=True
    )
    def test_accept_requester_last(self, enqueue):
        ScrimmageRequest.objects.update(player_order=PlayerOrder.REQUESTER_LAST)
        ScrimmageRequest.objects.accept()
        self.assertEqual(Match.objects.count(), self.n)
        self.assertEqual(Map.objects.get().scrimmage_requests.count(), self.n)
        self.assertEqual(
            MatchParticipant.objects.filter(team=self.teams[0], player_index=1).count(),
            self.n,
        )
        self.assertEqual(
            MatchParticipant.objects.filter(team=self.teams[1], player_index=0).count(),
            self.n,
        )
        self.assertEqual(Match.objects.filter(alternate_order=False).count(), self.n)

    @patch(
        "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue", autospec=True
    )
    def test_accept_shuffled(self, enqueue):
        ScrimmageRequest.objects.update(player_order=PlayerOrder.SHUFFLED)
        ScrimmageRequest.objects.accept()
        self.assertEqual(Match.objects.count(), self.n)
        self.assertEqual(Map.objects.get().scrimmage_requests.count(), self.n)

        q00 = MatchParticipant.objects.filter(team=self.teams[0], player_index=0)
        q01 = MatchParticipant.objects.filter(team=self.teams[0], player_index=1)
        q10 = MatchParticipant.objects.filter(team=self.teams[1], player_index=0)
        q11 = MatchParticipant.objects.filter(team=self.teams[1], player_index=1)

        self.assertEqual(Match.objects.filter(alternate_order=True).count(), self.n)
        self.assertTrue(q00.exists() and q01.exists() and q10.exists() and q11.exists())
        self.assertEqual(q00.count() + q01.count(), self.n)
        self.assertEqual(q10.count() + q11.count(), self.n)
