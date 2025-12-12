import random
import unittest
from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from siarnaq.api.compete.models import Match, MatchParticipant, Submission
from siarnaq.api.episodes.models import EligibilityCriterion, Episode, Language, Map
from siarnaq.api.teams.managers import generate_4regular_graph
from siarnaq.api.teams.models import Team, TeamStatus
from siarnaq.api.user.models import User


class Generate4RegularGraphTestCase(unittest.TestCase):
    """Test suite for generating regular graphs."""

    def inner_test(self, n):
        edges = generate_4regular_graph(n)
        # Canonicalize
        edges = [(min(u, v), max(u, v)) for u, v in edges]
        # Graph is valid
        self.assertTrue(all(0 <= u < v < n for u, v in edges))
        self.assertEqual(len(set(edges)), len(edges))
        # Graph is 4-regular
        for i in range(n):
            self.assertEqual(sum(u == i for e in edges for u in e), 4)
        # Graph satisfies specified properties
        self.assertTrue(all(abs(u - v) <= 4 for u, v in edges))
        for i in range(1, n - 1):
            neighbors = {(u ^ v ^ i) for u, v in edges if i in (u, v)}
            self.assertLess(min(neighbors), i)
            self.assertGreater(max(neighbors), i)

    def test_graph_valid_small(self):
        for n in range(5, 35):
            with self.subTest(n=n):
                random.seed(1)
                # Repeat several times because the graph is random.
                for repetition in range(100):
                    self.inner_test(n)

    def test_graph_valid_large(self):
        random.seed(1)
        # Repeat several times because the graph is random.
        for repetition in range(10):
            self.inner_test(500)


class AutoscrimmageTestCase(TestCase):
    """Test suite for generating automatic scrimmages."""

    def setUp(self):
        """Set up an environment in which matches are not sent to be enqueued."""
        self.patcher = patch(
            "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue",
            autospec=True,
        )

    def make_episode(self, name, *, n_public_maps):
        """Create an episode with the given quantity of associated public maps."""
        e = Episode.objects.create(
            name_short=name,
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            language=Language.JAVA_8,
        )
        for i in range(n_public_maps):
            Map.objects.create(episode=e, name=f"map{i}", is_public=True)
        return e

    def make_team(self, *, episode, name, n_submissions, **kwargs):
        """Create a team with the given quantity of accepted submissions."""
        t = Team.objects.create(episode=episode, name=name, **kwargs)
        u = User.objects.create_user(username=name, email=f"{name}@example.com")
        for i in range(n_submissions):
            Submission.objects.create(episode=episode, team=t, user=u, accepted=True)
        return t

    # Partitions:
    # - number of teams on episode: 0, 1, 2-4, 5+
    # - team episode: belongs, does not belong
    # - team status: regular, not regular
    # - team latest submission: accepted, not accepted, none
    # - team older submissions: some accepted, none accepted
    # - map episode: belongs, does not belong
    # - map status: public, not public

    def test_many_regular_teams(self):
        """5+ belong+regular teams, latest accepted, older none, map belongs+public"""
        n = 50
        e1 = self.make_episode("e1", n_public_maps=3)
        for i in range(n):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        with self.patcher as mock_enqueue:
            Team.objects.autoscrim(episode=e1, best_of=3)
        mock_enqueue.assert_called_once()
        matches = mock_enqueue.call_args.args[0]
        self.assertEqual(Match.objects.count(), 2 * n)
        self.assertEqual(matches.count(), 2 * n)
        for t in Team.objects.all():
            self.assertEqual(t.participations.count(), 4)
        for m in Map.objects.all():
            self.assertTrue(m.matches.exists())
        for m in Match.objects.all():
            self.assertEqual(m.maps.count(), 3)
        for p in MatchParticipant.objects.all():
            self.assertEqual(p.team, p.submission.team)

    def test_teams_count_0(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        self.assertFalse(Match.objects.exists())

    def test_teams_count_1(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        self.make_team(episode=e1, name="team", n_submissions=1)
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        self.assertFalse(Match.objects.exists())

    def test_teams_count_small(self):
        n = 4
        e1 = self.make_episode("e1", n_public_maps=3)
        for i in range(n):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        with self.patcher as mock_enqueue:
            Team.objects.autoscrim(episode=e1, best_of=3)
        mock_enqueue.assert_called_once()
        matches = mock_enqueue.call_args.args[0]
        self.assertEqual(matches.count(), 6)
        for t in Team.objects.all():
            self.assertEqual(t.participations.count(), 3)

    def test_team_episode_does_not_belong(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        e2 = self.make_episode("e2", n_public_maps=3)
        for i in range(3):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        for i in range(3):
            self.make_team(episode=e2, name=f"team{i+3}", n_submissions=1)
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        self.assertFalse(MatchParticipant.objects.filter(team__episode=e2).exists())

    def test_team_not_regular(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        for i in range(3):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        t = self.make_team(
            episode=e1, name="badteam", n_submissions=1, status=TeamStatus.STAFF
        )
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        self.assertFalse(MatchParticipant.objects.filter(team=t).exists())

    def test_team_latest_accepted_older_accepted(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        for i in range(3):
            t = self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        s1 = t.submissions.get()
        s2 = Submission.objects.create(
            episode=e1, team=t, user=User.objects.last(), accepted=True
        )
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        s1.refresh_from_db()
        s2.refresh_from_db()
        self.assertEqual(s1.participations.count(), 0)
        self.assertEqual(s2.participations.count(), 2)

    def test_team_latest_not_accepted_older_accepted(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        for i in range(3):
            t = self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        s1 = t.submissions.get()
        s2 = Submission.objects.create(
            episode=e1, team=t, user=User.objects.last(), accepted=False
        )
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        s1.refresh_from_db()
        s2.refresh_from_db()
        self.assertEqual(s1.participations.count(), 2)
        self.assertEqual(s2.participations.count(), 0)

    def test_team_latest_not_accepted_older_not_accepted(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        for i in range(3):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        t = self.make_team(episode=e1, name="badteam", n_submissions=0)
        s1 = Submission.objects.create(
            episode=e1, team=t, user=User.objects.last(), accepted=False
        )
        s2 = Submission.objects.create(
            episode=e1, team=t, user=User.objects.last(), accepted=False
        )
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        s1.refresh_from_db()
        s2.refresh_from_db()
        self.assertEqual(s1.participations.count(), 0)
        self.assertEqual(s2.participations.count(), 0)
        self.assertFalse(MatchParticipant.objects.filter(team=t).exists())

    def test_team_latest_none(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        for i in range(3):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        t = self.make_team(episode=e1, name="badteam", n_submissions=0)
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        self.assertFalse(MatchParticipant.objects.filter(team=t).exists())

    def test_map_does_not_belong(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        e2 = self.make_episode("e2", n_public_maps=3)
        for i in range(3):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        # Repeat many times because maps are selected randomly
        for i in range(100):
            with self.patcher:
                Team.objects.autoscrim(episode=e1, best_of=3)
        for m in Map.objects.filter(episode=e2):
            self.assertFalse(m.matches.exists())

    def test_map_not_public(self):
        e1 = self.make_episode("e1", n_public_maps=3)
        m = Map.objects.create(episode=e1, name="badmap", is_public=False)
        for i in range(3):
            self.make_team(episode=e1, name=f"team{i}", n_submissions=1)
        with self.patcher:
            Team.objects.autoscrim(episode=e1, best_of=3)
        m.refresh_from_db()
        self.assertFalse(m.matches.exists())


class EligibilityTestCase(APITestCase):
    """Test suite for team eligibility logic in Team API."""

    def setUp(self):
        self.episode = Episode.objects.create(
            name_short="ep",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            language=Language.JAVA_8,
        )

        self.team = Team.objects.create(episode=self.episode, name="t1")
        self.user = User.objects.create_user(username="u1", email="u1@example.com")
        self.team.members.add(self.user)

    # Partitions for: me (patch)
    # eligible_for: contains private criteria, doesn't contain private criteria
    # eligible_for: criteria all in team's assigned episode, or not
    def test_patch_criterion_private(self):
        criterion1 = EligibilityCriterion.objects.create(
            title="crit1", description="desc1", icon="i1", is_private=False
        )
        criterion2 = EligibilityCriterion.objects.create(
            title="crit2", description="desc2", icon="i2", is_private=True
        )

        self.episode.eligibility_criteria.add(criterion1)
        self.episode.eligibility_criteria.add(criterion2)
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            reverse("team-me", kwargs={"episode_id": "ep"}),
            {"profile": {"eligible_for": [criterion1.pk]}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.patch(
            reverse("team-me", kwargs={"episode_id": "ep"}),
            {"profile": {"eligible_for": [criterion1.pk, criterion2.pk]}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_criterion_wrong_episode(self):
        criterion = EligibilityCriterion.objects.create(
            title="crit", description="desc", icon="i", is_private=False
        )
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            reverse("team-me", kwargs={"episode_id": "ep"}),
            {"profile": {"eligible_for": [criterion.pk]}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
