from django.test import TestCase
from django.utils import timezone

from siarnaq.api.compete.models import Match, MatchParticipant, SaturnStatus, Submission
from siarnaq.api.episodes.models import Episode, Language
from siarnaq.api.teams.models import Rating, Team, TeamProfile
from siarnaq.api.user.models import User


class MatchParticipantTestCase(TestCase):
    """Test suite for the MatchParticipant model."""

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
                user=User.objects.create_user(username=name + "_user", password=name),
                accepted=True,
            )

    # Partitions for: creation. Testing linked list of participations for a single team.
    # - team only has 1 participation
    # - team has more than 1 participation

    def test_linked_list_single_element(self):
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        p1 = MatchParticipant.objects.create(team=t1)
        p2 = MatchParticipant.objects.create(team=t2)
        p3 = MatchParticipant.objects.create(team=t3)
        for p in [p1, p2, p3]:
            self.assertIsNone(p.previous_participation)
            self.assertFalse(hasattr(p, "next_participation"))

    def test_linked_list_multiple_element(self):
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        p1 = MatchParticipant.objects.create(team=t1)
        p2 = MatchParticipant.objects.create(team=t2)
        p3 = MatchParticipant.objects.create(team=t1)

        self.assertIsNone(p1.previous_participation)
        self.assertEqual(p1.next_participation, p3)
        self.assertIsNone(p2.previous_participation)
        self.assertFalse(hasattr(p2, "next_participation"))
        self.assertEqual(p3.previous_participation, p1)
        self.assertFalse(hasattr(p3, "next_participation"))

    # Partitions for: rating. Testing finalizations occur iff prerequisites are met.
    # - match type:
    #   - ranked
    #   - unranked
    # - match status:
    #   - completed successfully
    #   - failed
    #   - in progress
    # - previous participation status:
    #   - finalized
    #   - not finalized
    #   - does not exist

    def test_finalize_ranked_completed_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1, rating=r1),
            blue=MatchParticipant.objects.create(team=t2, score=0, rating=r2),
            alternate_color=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        m2 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t3, score=0),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        # Expect rating increase after win
        self.assertIsNotNone(m2.red.rating)
        self.assertGreater(m2.red.rating.mean, m2.red.get_old_rating().mean)
        self.assertEqual(m2.red.rating.n, r1.n + 1)
        self.assertEqual(t1.profile.rating, m2.red.rating)

    def test_finalize_ranked_completed_previous_not_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t2),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        m2 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t3, score=0),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        # Expect no rating because previous not ready
        self.assertIsNone(m2.red.rating)

    def test_finalize_ranked_completed_previous_nonexistent(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        m1 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t2, score=0),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        # Expect rating increase after win
        self.assertIsNotNone(m1.red.rating)
        self.assertGreater(m1.red.rating.mean, m1.red.get_old_rating().mean)
        self.assertEqual(m1.red.rating.n, 1)
        self.assertEqual(t1.profile.rating, m1.red.rating)

    def test_finalize_ranked_failed_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1, rating=r1),
            blue=MatchParticipant.objects.create(team=t2, score=0, rating=r2),
            alternate_color=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        m2 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t3),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.ERRORED,
        )
        # Expect no change because no result
        self.assertEqual(m2.red.rating, m1.red.rating)

    def test_finalize_ranked_failed_previous_not_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t2),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        m2 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t3),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.ERRORED,
        )
        # Expect no rating because previous not ready
        self.assertIsNone(m2.red.rating)

    def test_finalize_ranked_inprogress_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1, rating=r1),
            blue=MatchParticipant.objects.create(team=t2, score=0, rating=r2),
            alternate_color=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        m2 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t3),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        # Expect no rating because no result
        self.assertIsNone(m2.red.rating)

    def test_finalize_unranked_completed_previous_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1, rating=r1),
            blue=MatchParticipant.objects.create(team=t2, score=0, rating=r2),
            alternate_color=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        m2 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t3, score=0),
            alternate_color=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        # Expect no change because unranked
        self.assertEqual(m2.red.rating, m1.red.rating)
        self.assertEqual(t1.profile.rating, m2.red.rating)

    def test_finalize_unranked_completed_previous_not_ready(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t2),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        m2 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t3, score=0),
            alternate_color=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        # Expect no rating because previous not ready
        self.assertIsNone(m2.red.rating)

    def test_finalize_unranked_completed_previous_nonexistent(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        m1 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t2, score=0),
            alternate_color=True,
            is_ranked=False,
            status=SaturnStatus.COMPLETED,
        )
        # Expect no change because unranked
        self.assertIsNotNone(m1.red.rating)
        self.assertEqual(m1.red.rating.to_value(), m1.red.get_old_rating().to_value())
        self.assertEqual(m1.red.rating.n, 0)
        self.assertEqual(t1.profile.rating.to_value(), m1.red.rating.to_value())

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
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t2),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t2),
            blue=MatchParticipant.objects.create(team=t3),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        m3 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t3, score=0),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        m1.status, m1.red.score, m1.blue.score = SaturnStatus.COMPLETED, 1, 0
        m1.red.save()
        m1.blue.save()
        m1.save()
        # Expect m3 red to not be finalized yet, because t3 is not finalized
        self.assertIsNotNone(m1.red.rating)
        self.assertGreater(m1.red.rating.mean, m1.red.get_old_rating().mean)
        self.assertEqual(m1.red.rating.n, 1)
        self.assertEqual(t1.profile.rating, m1.red.rating)
        self.assertIsNone(m3.red.rating)
        self.assertIsNone(m3.blue.rating)

    def test_chain_opponent_finalized(self):
        e1 = Episode.objects.get(name_short="e1")
        t1 = Team.objects.get(name="team1")
        t2 = Team.objects.get(name="team2")
        t3 = Team.objects.get(name="team3")
        r1 = Rating.objects.create(n=10)
        r2 = Rating.objects.create(n=20)
        m1 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1),
            blue=MatchParticipant.objects.create(team=t2),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.RUNNING,
        )
        Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t2, score=1, rating=r1),
            blue=MatchParticipant.objects.create(team=t3, score=0, rating=r2),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        m3 = Match.objects.create(
            episode=e1,
            red=MatchParticipant.objects.create(team=t1, score=1),
            blue=MatchParticipant.objects.create(team=t3, score=0),
            alternate_color=True,
            is_ranked=True,
            status=SaturnStatus.COMPLETED,
        )
        m1.status, m1.red.score, m1.blue.score = SaturnStatus.COMPLETED, 1, 0
        m1.red.save()
        m1.blue.save()
        m1.save()
        # Expect m3 red and blue to be both finalized
        m3.refresh_from_db()
        self.assertIsNotNone(m3.red.rating)
        self.assertGreater(m3.red.rating.mean, m3.red.get_old_rating().mean)
        self.assertEqual(m3.red.rating.n, 2)
        self.assertIsNotNone(m3.blue.rating)
        self.assertLess(m3.blue.rating.mean, m3.blue.get_old_rating().mean)
        self.assertEqual(m3.blue.rating.n, r2.n + 1)
