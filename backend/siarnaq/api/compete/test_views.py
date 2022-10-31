import io
import random
from datetime import timedelta
from unittest.mock import mock_open, patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from siarnaq.api.compete.models import SaturnStatus, Submission
from siarnaq.api.episodes.models import Episode, Language
from siarnaq.api.teams.models import Team
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

    @patch("django.conf.settings.GCLOUD_DISABLE_ALL_ACTIONS", new=False)
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

    @patch("django.conf.settings.GCLOUD_DISABLE_ALL_ACTIONS", new=False)
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
