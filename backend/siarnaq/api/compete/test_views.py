import io
import random
from datetime import timedelta
from unittest.mock import mock_open, patch

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase

from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    PlayerColor,
    SaturnStatus,
    ScrimmageRequest,
    ScrimmageRequestStatus,
    Submission,
)
from siarnaq.api.compete.serializers import MatchSerializer
from siarnaq.api.episodes.models import (
    Episode,
    Language,
    Map,
    Tournament,
    TournamentRound,
    TournamentStyle,
)
from siarnaq.api.teams.models import Rating, Team, TeamProfile, TeamStatus
from siarnaq.api.user.models import User


class SubmissionViewSetTestCase(APITestCase):
    """Test suite for the Submissions API."""

    def setUp(self):
        self.e1 = Episode.objects.create(
            name_short="e1",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            submission_frozen=False,
            language=Language.JAVA_8,
        )
        self.user = User.objects.create_user(username="user1")
        self.team = Team.objects.create(episode=self.e1, name="team1")
        self.team.members.add(self.user)
        other_user = User.objects.create_user(username="user2")
        other_team = Team.objects.create(episode=self.e1, name="team2")
        other_team.members.add(other_user)
        self.admin = User.objects.create_user(username="admin", is_staff=True)

    # Partitions for: create.
    # user: on team, not on team, not authenticated
    # user: staff, not staff
    # episode: frozen, not frozen, hidden
    # file size: large, small

    @patch("siarnaq.gcloud.enable_actions", new=True)
    @patch("google.cloud.storage.Blob.open")
    @patch(
        "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue", autospec=True
    )
    def test_create_has_team_staff_hidden_small(self, enqueue, writer):
        mock_open(writer)
        self.user.is_staff = True
        self.user.save()
        self.client.force_authenticate(self.user)
        with io.BytesIO(b"abcdefg") as f:
            response = self.client.post(
                reverse("submission-list", kwargs={"episode_id": "e1"}),
                {"package": "bot", "description": "New bot", "source_code": f},
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        s = Submission.objects.get()
        self.assertEqual(s.episode, self.e1)
        self.assertEqual(s.team, self.team)
        self.assertEqual(s.user, self.user)
        self.assertEqual(s.package, "bot")
        self.assertEqual(s.description, "New bot")

        writer().write.assert_called()
        written = b"".join(call.args[0] for call in writer().write.call_args_list)
        self.assertEqual(b"abcdefg", written)

    def test_create_has_team_not_staff_frozen(self):
        self.client.force_authenticate(self.user)
        self.e1.submission_frozen = True
        self.e1.save()
        with io.BytesIO(b"abcdefg") as f:
            response = self.client.post(
                reverse("submission-list", kwargs={"episode_id": "e1"}),
                {"package": "bot", "description": "New bot", "source_code": f},
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Submission.objects.exists())

    @patch("siarnaq.gcloud.enable_actions", new=True)
    @patch("google.cloud.storage.Blob.open")
    @patch(
        "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue", autospec=True
    )
    def test_create_has_team_not_staff_not_frozen_large(self, enqueue, writer):
        random.seed(1)
        data = random.randbytes(2**27)  # 128MiB of stuff
        mock_open(writer)
        self.client.force_authenticate(self.user)
        with io.BytesIO(data) as f:
            response = self.client.post(
                reverse("submission-list", kwargs={"episode_id": "e1"}),
                {"package": "bot", "description": "New bot", "source_code": f},
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        s = Submission.objects.get()
        self.assertEqual(s.episode, self.e1)
        self.assertEqual(s.team, self.team)
        self.assertEqual(s.user, self.user)
        self.assertEqual(s.package, "bot")
        self.assertEqual(s.description, "New bot")

        writer().write.assert_called()
        written = b"".join(call.args[0] for call in writer().write.call_args_list)
        self.assertEqual(data, written)

    def test_create_has_team_not_staff_hidden(self):
        self.client.force_authenticate(self.user)
        self.e1.registration += timedelta(days=1)
        self.e1.game_release += timedelta(days=1)
        self.e1.game_archive += timedelta(days=1)
        self.e1.save()
        with io.BytesIO(b"abcdefg") as f:
            response = self.client.post(
                reverse("submission-list", kwargs={"episode_id": "e1"}),
                {"package": "bot", "description": "New bot", "source_code": f},
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Submission.objects.exists())

    def test_create_no_team(self):
        self.client.force_authenticate(User.objects.create_user(username="user3"))
        with io.BytesIO(b"abcdefg") as f:
            response = self.client.post(
                reverse("submission-list", kwargs={"episode_id": "e1"}),
                {"package": "bot", "description": "New bot", "source_code": f},
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Submission.objects.exists())

    def test_create_no_user(self):
        with io.BytesIO(b"abcdefg") as f:
            response = self.client.post(
                reverse("submission-list", kwargs={"episode_id": "e1"}),
                {"package": "bot", "description": "New bot", "source_code": f},
                format="multipart",
            )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(Submission.objects.exists())

    # Partitions for: report.
    # user: admin, not admin
    # previous state: finalized, not finalized
    # new state: valid, invalid
    # accepted: provided, blank

    def test_report_admin_was_final_now_valid(self):
        s = Submission.objects.create(
            episode=self.e1,
            team=self.team,
            user=self.user,
            status=SaturnStatus.COMPLETED,
            logs="abc",
            accepted=False,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            reverse("submission-report", kwargs={"episode_id": "e1", "pk": s.pk}),
            {
                "invocation": {"status": SaturnStatus.ERRORED, "logs": "def"},
                "accepted": True,
            },
            format="json",
        )
        self.assertTrue(status.is_success(response.status_code))
        s.refresh_from_db()
        self.assertEqual(s.status, SaturnStatus.COMPLETED)
        self.assertEqual(s.logs, "abc")
        self.assertFalse(s.accepted)

    def test_report_admin_was_unfinal_now_valid_provided(self):
        s = Submission.objects.create(
            episode=self.e1,
            team=self.team,
            user=self.user,
            status=SaturnStatus.RUNNING,
            logs="abc",
            accepted=False,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            reverse("submission-report", kwargs={"episode_id": "e1", "pk": s.pk}),
            {
                "invocation": {"status": SaturnStatus.COMPLETED, "logs": "def"},
                "accepted": True,
            },
            format="json",
        )
        self.assertTrue(status.is_success(response.status_code))
        s.refresh_from_db()
        self.assertEqual(s.status, SaturnStatus.COMPLETED)
        self.assertEqual(s.logs, "abcdef")
        self.assertTrue(s.accepted)

    def test_report_admin_was_unfinal_now_valid_blank(self):
        s = Submission.objects.create(
            episode=self.e1,
            team=self.team,
            user=self.user,
            status=SaturnStatus.QUEUED,
            logs="abc",
            accepted=False,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            reverse("submission-report", kwargs={"episode_id": "e1", "pk": s.pk}),
            {"invocation": {"status": SaturnStatus.RUNNING, "logs": "def"}},
            format="json",
        )
        self.assertTrue(status.is_success(response.status_code))
        s.refresh_from_db()
        self.assertEqual(s.status, SaturnStatus.RUNNING)
        self.assertEqual(s.logs, "abcdef")
        self.assertFalse(s.accepted)

    def test_report_admin_was_unfinal_now_invalid(self):
        s = Submission.objects.create(
            episode=self.e1,
            team=self.team,
            user=self.user,
            status=SaturnStatus.RUNNING,
            logs="abc",
            accepted=False,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            reverse("submission-report", kwargs={"episode_id": "e1", "pk": s.pk}),
            {"invocation": {"status": "QWE", "logs": "def"}, "accepted": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        s.refresh_from_db()
        self.assertEqual(s.status, SaturnStatus.RUNNING)
        self.assertEqual(s.logs, "abc")
        self.assertFalse(s.accepted)

    def test_report_not_admin(self):
        s = Submission.objects.create(
            episode=self.e1,
            team=self.team,
            user=self.user,
            status=SaturnStatus.RUNNING,
            logs="abc",
            accepted=False,
        )
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("submission-report", kwargs={"episode_id": "e1", "pk": s.pk}),
            {
                "invocation": {"status": SaturnStatus.COMPLETED, "logs": "def"},
                "accepted": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        s.refresh_from_db()
        self.assertEqual(s.status, SaturnStatus.RUNNING)
        self.assertEqual(s.logs, "abc")
        self.assertFalse(s.accepted)


class MatchSerializerTestCase(TestCase):
    """Test suite for the Match serializer."""

    def setUp(self):
        self.e1 = Episode.objects.create(
            name_short="e1",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            language=Language.JAVA_8,
        )
        self.map = Map.objects.create(episode=self.e1, name="map")
        tournament = Tournament.objects.create(
            name_short="t",
            episode=self.e1,
            style=TournamentStyle.DOUBLE_ELIMINATION,
            require_resume=False,
            is_public=True,
            submission_freeze=timezone.now(),
            submission_unfreeze=timezone.now(),
        )
        self.r_released = TournamentRound.objects.create(
            tournament=tournament, is_released=True
        )
        self.r_unreleased = TournamentRound.objects.create(
            tournament=tournament, is_released=False
        )

        self.users, self.teams, self.submissions = [], [], []
        for i in range(4):
            u = User.objects.create(username=f"user{i}")
            t = Team.objects.create(episode=self.e1, name=f"team{i}")
            t.members.add(u)
            self.submissions.append(
                Submission.objects.create(
                    episode=self.e1, team=t, user=u, accepted=True
                )
            )
            self.users.append(u)
            self.teams.append(t)
        self.teams[-1].status = TeamStatus.STAFF
        self.teams[-1].save()
        self.staff = User.objects.create(username="staff", is_staff=True)

    # Partitions:
    # user: admin, not admin
    # match: includes self, without self
    # match: includes regular staff team, includes invisible team, without staff team
    # match tournament round: released, not released, none

    def test_admin_has_staff_team_tournament_not_released(self):
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": None,
                "user_id": self.staff.pk,
                "user_is_staff": True,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=self.r_unreleased,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=True,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": {
                    "team": match.red.team.pk,
                    "teamname": match.red.team.name,
                    "submission": match.red.submission.pk,
                    "score": match.red.score,
                    "rating": match.red.rating.to_value(),
                    "old_rating": match.red.get_old_rating().to_value(),
                },
                "blue": {
                    "team": match.blue.team.pk,
                    "teamname": match.blue.team.name,
                    "submission": match.blue.submission.pk,
                    "score": match.blue.score,
                    "rating": match.blue.rating.to_value(),
                    "old_rating": match.blue.get_old_rating().to_value(),
                },
                "maps": [self.map.name],
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": str(match.replay),
            },
        )

    def test_not_admin_has_self_has_staff_team(self):
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": self.teams[0],
                "user_id": self.users[0].pk,
                "user_is_staff": False,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=None,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[-1],
                submission=self.submissions[-1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": {
                    "team": match.red.team.pk,
                    "teamname": match.red.team.name,
                    "submission": match.red.submission.pk,
                    "score": match.red.score,
                    "rating": match.red.rating.to_value(),
                    "old_rating": match.red.get_old_rating().to_value(),
                },
                "blue": {
                    "team": match.blue.team.pk,
                    "teamname": match.blue.team.name,
                    "submission": None,
                    "score": match.blue.score,
                    "rating": match.blue.rating.to_value(),
                    "old_rating": match.blue.get_old_rating().to_value(),
                },
                "maps": [self.map.name],
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": str(match.replay),
            },
        )

    def test_not_admin_has_self_no_staff_team_tournament_released(self):
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": self.teams[0],
                "user_id": self.users[0].pk,
                "user_is_staff": False,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=self.r_released,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": {
                    "team": match.red.team.pk,
                    "teamname": match.red.team.name,
                    "submission": match.red.submission.pk,
                    "score": match.red.score,
                    "rating": match.red.rating.to_value(),
                    "old_rating": match.red.get_old_rating().to_value(),
                },
                "blue": {
                    "team": match.blue.team.pk,
                    "teamname": match.blue.team.name,
                    "submission": None,
                    "score": match.blue.score,
                    "rating": match.blue.rating.to_value(),
                    "old_rating": match.blue.get_old_rating().to_value(),
                },
                "maps": [self.map.name],
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": str(match.replay),
            },
        )

    def test_not_admin_has_self_no_staff_team_tournament_not_released(self):
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": self.teams[0],
                "user_id": self.users[0].pk,
                "user_is_staff": False,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=self.r_unreleased,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": None,
                "blue": None,
                "maps": None,
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": None,
            },
        )

    def test_not_admin_has_self_no_staff_team_tournament_none(self):
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": self.teams[0],
                "user_id": self.users[0].pk,
                "user_is_staff": False,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=None,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": {
                    "team": match.red.team.pk,
                    "teamname": match.red.team.name,
                    "submission": match.red.submission.pk,
                    "score": match.red.score,
                    "rating": match.red.rating.to_value(),
                    "old_rating": match.red.get_old_rating().to_value(),
                },
                "blue": {
                    "team": match.blue.team.pk,
                    "teamname": match.blue.team.name,
                    "submission": None,
                    "score": match.blue.score,
                    "rating": match.blue.rating.to_value(),
                    "old_rating": match.blue.get_old_rating().to_value(),
                },
                "maps": [self.map.name],
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": str(match.replay),
            },
        )

    def test_not_admin_no_self_has_staff_team(self):
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": self.teams[0],
                "user_id": self.users[0].pk,
                "user_is_staff": False,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=None,
            red=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[-1],
                submission=self.submissions[-1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": {
                    "team": match.red.team.pk,
                    "teamname": match.red.team.name,
                    "submission": None,
                    "score": None,
                    "rating": match.red.rating.to_value(),
                    "old_rating": match.red.get_old_rating().to_value(),
                },
                "blue": {
                    "team": match.blue.team.pk,
                    "teamname": match.blue.team.name,
                    "submission": None,
                    "score": None,
                    "rating": match.blue.rating.to_value(),
                    "old_rating": match.blue.get_old_rating().to_value(),
                },
                "maps": [self.map.name],
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": None,
            },
        )

    def test_not_admin_no_self_has_invisible_team(self):
        self.teams[-1].status = TeamStatus.INVISIBLE
        self.teams[-1].save()
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": self.teams[0],
                "user_id": self.users[0].pk,
                "user_is_staff": False,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=None,
            red=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[-1],
                submission=self.submissions[-1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": None,
                "blue": None,
                "maps": None,
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": None,
            },
        )

    def test_not_admin_no_self_no_staff_team(self):
        serializer = MatchSerializer(
            context={
                "episode_id": self.e1.pk,
                "team_id": self.teams[0],
                "user_id": self.users[0].pk,
                "user_is_staff": False,
                "team_is_staff": False,
            }
        )
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=None,
            red=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[2],
                submission=self.submissions[2],
                score=2,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        data = serializer.to_representation(match)
        self.assertEqual(
            data,
            {
                "id": match.pk,
                "status": str(match.status),
                "episode": match.episode.pk,
                "red": {
                    "team": match.red.team.pk,
                    "teamname": match.red.team.name,
                    "submission": None,
                    "score": match.red.score,
                    "rating": match.red.rating.to_value(),
                    "old_rating": match.red.get_old_rating().to_value(),
                },
                "blue": {
                    "team": match.blue.team.pk,
                    "teamname": match.blue.team.name,
                    "submission": None,
                    "score": match.blue.score,
                    "rating": match.blue.rating.to_value(),
                    "old_rating": match.blue.get_old_rating().to_value(),
                },
                "maps": [self.map.name],
                "alternate_color": match.alternate_color,
                "created": match.created.isoformat().replace("+00:00", "Z"),
                "is_ranked": match.is_ranked,
                "replay": None,
            },
        )


class MatchViewSetTestCase(APITestCase):
    """Test suite for the Matches API."""

    def setUp(self):
        self.e1 = Episode.objects.create(
            name_short="e1",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            language=Language.JAVA_8,
        )
        self.map = Map.objects.create(episode=self.e1, name="map")
        tournament = Tournament.objects.create(
            name_short="t",
            episode=self.e1,
            style=TournamentStyle.DOUBLE_ELIMINATION,
            require_resume=False,
            is_public=True,
            submission_freeze=timezone.now(),
            submission_unfreeze=timezone.now(),
        )
        self.r_released = TournamentRound.objects.create(
            tournament=tournament, is_released=True
        )
        self.r_unreleased = TournamentRound.objects.create(
            tournament=tournament, is_released=False
        )

        self.users, self.teams, self.submissions = [], [], []
        for i in range(2):
            u = User.objects.create(username=f"user{i}")
            t = Team.objects.create(episode=self.e1, name=f"team{i}")
            t.members.add(u)
            self.submissions.append(
                Submission.objects.create(
                    episode=self.e1, team=t, user=u, accepted=True
                )
            )
            self.users.append(u)
            self.teams.append(t)

    # Partitions for: my.
    # match tournament round: released, not released, none

    def test_my_released(self):
        self.client.force_authenticate(self.users[0])
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=self.r_released,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        response = self.client.get(reverse("match-my", kwargs={"episode_id": "e1"}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # We define scrimmaages to be non-tournament matches, so we don't expect them
        # here. This is purely a design choice.
        self.assertEqual(len(response.json()["results"]), 0)

    def test_my_not_released(self):
        self.client.force_authenticate(self.users[0])
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=self.r_unreleased,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        response = self.client.get(reverse("match-my", kwargs={"episode_id": "e1"}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # It is important that unreleased tournament matches don't get exposed here.
        self.assertEqual(len(response.json()["results"]), 0)

    def test_my_none(self):
        self.client.force_authenticate(self.users[0])
        match = Match.objects.create(
            episode=self.e1,
            tournament_round=None,
            red=MatchParticipant.objects.create(
                team=self.teams[0],
                submission=self.submissions[0],
                score=0,
                rating=Rating.objects.create(),
            ),
            blue=MatchParticipant.objects.create(
                team=self.teams[1],
                submission=self.submissions[1],
                score=1,
                rating=Rating.objects.create(),
            ),
            alternate_color=True,
            is_ranked=False,
        )
        match.maps.add(self.map)
        response = self.client.get(reverse("match-my", kwargs={"episode_id": "e1"}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["results"]), 1)


class ScrimmageRequestViewSetTestCase(APITransactionTestCase):
    """Test suite for the Scrimmage Requests API."""

    def setUp(self):
        self.e1 = Episode.objects.create(
            name_short="e1",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            submission_frozen=False,
            language=Language.JAVA_8,
        )
        self.e2 = Episode.objects.create(
            name_short="e2",
            registration=timezone.now(),
            game_release=timezone.now(),
            game_archive=timezone.now(),
            submission_frozen=False,
            language=Language.JAVA_8,
        )
        self.maps = []
        for i in range(5):
            self.maps.append(
                Map.objects.create(
                    episode=self.e1 if i < 4 else self.e2,
                    name=f"map{i}",
                    is_public=i != 3,
                )
            )
        self.users, self.teams, self.submissions = [], [], []
        for i in range(3):
            u = User.objects.create(username=f"user{i}")
            t = Team.objects.create(
                episode=self.e1 if i < 2 else self.e2, name=f"team{i}"
            )
            t.members.add(u)
            TeamProfile.objects.create(
                team=t,
                rating=Rating.objects.create(),
                auto_accept_ranked=False,
                auto_accept_unranked=False,
            )
            self.submissions.append(
                Submission.objects.create(
                    episode=self.e1, team=t, user=u, accepted=True
                )
            )
            self.users.append(u)
            self.teams.append(t)

    # Partitions for: create.
    # team auto accept: on, off
    # user team: is staff, not staff
    # user team submission: accepted, not accepted
    # opponent team: is valid regular, is hidden, is self
    # opponent submission: accepted, not accepted
    # episode: frozen, not frozen, hidden, mismatched
    # maps: valid, hidden, mismatched
    # (ranked, staff) combination: is legal, is illegal

    @patch(
        "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue", autospec=True
    )
    def test_create_autoaccept(self, enqueue):
        self.client.force_authenticate(self.users[0])
        self.teams[1].profile.auto_accept_ranked = True
        self.teams[1].profile.save()
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        r = ScrimmageRequest.objects.get()
        self.assertEqual(r.status, ScrimmageRequestStatus.ACCEPTED)
        self.assertTrue(Match.objects.exists())
        self.assertEqual(Match.objects.get().maps.count(), 3)
        enqueue.assert_called()

    def test_create_noauto_accepted_accepted_episode_not_frozen_maps_valid(self):
        self.client.force_authenticate(self.users[0])
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        r = ScrimmageRequest.objects.get()
        self.assertEqual(r.episode, self.e1)
        self.assertEqual(r.status, ScrimmageRequestStatus.PENDING)
        self.assertEqual(r.is_ranked, True)
        self.assertEqual(r.requested_by, self.teams[0])
        self.assertEqual(r.requested_to, self.teams[1])
        self.assertEqual(r.requester_color, PlayerColor.ALWAYS_RED)
        self.assertEqual(r.maps.count(), 3)
        self.assertFalse(Match.objects.exists())

    def test_create_accepted_notaccepted(self):
        self.client.force_authenticate(self.users[0])
        self.submissions[1].accepted = False
        self.submissions[1].save()
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_notaccepted_accepted(self):
        self.client.force_authenticate(self.users[0])
        self.submissions[0].accepted = False
        self.submissions[0].save()
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_self_staff_opponent_hidden(self):
        self.client.force_authenticate(self.users[0])
        self.teams[0].status = TeamStatus.STAFF
        self.teams[0].save()
        self.teams[1].status = TeamStatus.INVISIBLE
        self.teams[1].save()
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": False,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ScrimmageRequest.objects.exists())

    def test_create_self_not_staff_opponent_hidden(self):
        self.client.force_authenticate(self.users[0])
        self.teams[1].status = TeamStatus.INACTIVE
        self.teams[1].save()
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_opponent_self(self):
        self.client.force_authenticate(self.users[0])
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[0].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_episode_frozen(self):
        self.client.force_authenticate(self.users[0])
        self.e1.submission_frozen = True
        self.e1.save()
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_episode_hidden(self):
        self.client.force_authenticate(self.users[0])
        self.e1.registration += timedelta(days=1)
        self.e1.game_release += timedelta(days=1)
        self.e1.game_archive += timedelta(days=1)
        self.e1.save()
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_episode_mismatched(self):
        self.client.force_authenticate(self.users[0])
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[2].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map2"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_maps_hidden(self):
        self.client.force_authenticate(self.users[0])
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map3"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_maps_mismatched(self):
        self.client.force_authenticate(self.users[0])
        response = self.client.post(
            reverse("request-list", kwargs={"episode_id": "e1"}),
            {
                "is_ranked": True,
                "requested_to": self.teams[1].pk,
                "requester_color": PlayerColor.ALWAYS_RED,
                "map_names": ["map0", "map1", "map4"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_rankedtest_selfregular_opponentstaff(self):
        self.teams[1].status = TeamStatus.STAFF
        self.teams[1].save()
        for is_ranked, success in [(True, False), (False, True)]:
            with self.subTest(is_ranked=is_ranked, success=success):
                self.client.force_authenticate(self.users[0])
                response = self.client.post(
                    reverse("request-list", kwargs={"episode_id": "e1"}),
                    {
                        "is_ranked": is_ranked,
                        "requested_to": self.teams[1].pk,
                        "requester_color": PlayerColor.ALWAYS_RED,
                        "map_names": ["map0", "map1", "map2"],
                    },
                    format="json",
                )
                if success:
                    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                    self.assertTrue(ScrimmageRequest.objects.exists())
                else:
                    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                    self.assertFalse(ScrimmageRequest.objects.exists())

    def test_create_rankedtest_selfstaff_opponentregular(self):
        self.teams[0].status = TeamStatus.STAFF
        self.teams[0].save()
        for is_ranked, success in [(True, False), (False, True)]:
            with self.subTest(is_ranked=is_ranked, success=success):
                self.client.force_authenticate(self.users[0])
                response = self.client.post(
                    reverse("request-list", kwargs={"episode_id": "e1"}),
                    {
                        "is_ranked": is_ranked,
                        "requested_to": self.teams[1].pk,
                        "requester_color": PlayerColor.ALWAYS_RED,
                        "map_names": ["map0", "map1", "map2"],
                    },
                    format="json",
                )
                if success:
                    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                    self.assertTrue(ScrimmageRequest.objects.exists())
                else:
                    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                    self.assertFalse(ScrimmageRequest.objects.exists())

    # Partitions for: accept.
    # team: valid, invalid
    # status: pending, not pending
    # episode: frozen, not frozen

    @patch(
        "siarnaq.api.compete.managers.SaturnInvokableQuerySet.enqueue", autospec=True
    )
    def test_accept_team_valid_pending(self, enqueue):
        self.client.force_authenticate(self.users[1])
        r = ScrimmageRequest.objects.create(
            episode=self.e1,
            is_ranked=True,
            requested_by=self.teams[0],
            requested_to=self.teams[1],
            requester_color=PlayerColor.ALWAYS_RED,
        )
        r.maps.add(*self.maps[:3])
        response = self.client.post(
            reverse("request-accept", kwargs={"episode_id": "e1", "pk": r.pk}),
            {},
            format="json",
        )
        self.assertTrue(status.is_success(response.status_code))
        m = Match.objects.get()
        self.assertEqual(m.episode, self.e1)
        self.assertEqual(m.tournament_round, None)
        self.assertEqual(m.red.team, self.teams[0])
        self.assertEqual(m.red.submission, self.submissions[0])
        self.assertEqual(m.red.score, None)
        self.assertEqual(m.red.rating, None)
        self.assertEqual(m.blue.team, self.teams[1])
        self.assertEqual(m.blue.submission, self.submissions[1])
        self.assertEqual(m.blue.score, None)
        self.assertEqual(m.blue.rating, None)
        self.assertEqual(m.maps.count(), 3)
        self.assertEqual(m.alternate_color, False)
        self.assertEqual(m.is_ranked, True)
        enqueue.assert_called()

    def test_accept_team_valid_not_pending(self):
        self.client.force_authenticate(self.users[1])
        r = ScrimmageRequest.objects.create(
            episode=self.e1,
            status=ScrimmageRequestStatus.ACCEPTED,
            is_ranked=True,
            requested_by=self.teams[0],
            requested_to=self.teams[1],
            requester_color=PlayerColor.ALWAYS_RED,
        )
        r.maps.add(*self.maps[:3])
        response = self.client.post(
            reverse("request-accept", kwargs={"episode_id": "e1", "pk": r.pk}),
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Match.objects.exists())

    def test_accept_team_invalid(self):
        self.client.force_authenticate(self.users[0])
        r = ScrimmageRequest.objects.create(
            episode=self.e1,
            status=ScrimmageRequestStatus.PENDING,
            is_ranked=True,
            requested_by=self.teams[0],
            requested_to=self.teams[1],
            requester_color=PlayerColor.ALWAYS_RED,
        )
        r.maps.add(*self.maps[:3])
        response = self.client.post(
            reverse("request-accept", kwargs={"episode_id": "e1", "pk": r.pk}),
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Match.objects.exists())

    def test_accept_episode_frozen(self):
        self.client.force_authenticate(self.users[1])
        self.e1.submission_frozen = True
        self.e1.save()
        r = ScrimmageRequest.objects.create(
            episode=self.e1,
            status=ScrimmageRequestStatus.PENDING,
            is_ranked=True,
            requested_by=self.teams[0],
            requested_to=self.teams[1],
            requester_color=PlayerColor.ALWAYS_RED,
        )
        r.maps.add(*self.maps[:3])
        response = self.client.post(
            reverse("request-accept", kwargs={"episode_id": "e1", "pk": r.pk}),
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Match.objects.exists())

    # Partitions for: destroy.
    # episode: frozen, not frozen

    def test_destroy_ignores_freeze(self):
        for frozen in [False, True]:
            with self.subTest(frozen=frozen):
                self.client.force_authenticate(self.users[0])
                self.e1.submission_frozen = frozen
                self.e1.save()
                r = ScrimmageRequest.objects.create(
                    episode=self.e1,
                    status=ScrimmageRequestStatus.PENDING,
                    is_ranked=True,
                    requested_by=self.teams[0],
                    requested_to=self.teams[1],
                    requester_color=PlayerColor.ALWAYS_RED,
                )
                r.maps.add(*self.maps[:3])
                response = self.client.delete(
                    reverse("request-detail", kwargs={"episode_id": "e1", "pk": r.pk}),
                    {},
                    format="json",
                )
                self.assertTrue(status.is_success(response.status_code))
                self.assertFalse(ScrimmageRequest.objects.exists())
