import tempfile
import uuid
from zipfile import ZipFile

import google.cloud.storage as storage
from django.conf import settings
from django.contrib.auth.models import UserManager as DjangoUserManager
from django.db.models import Count, Exists, Max, OuterRef, Q

from siarnaq.gcloud import titan


class UserManager(DjangoUserManager):
    def with_passed(self, requirement):
        from siarnaq.api.compete.models import Match, MatchParticipant

        return self.annotate(
            passed=Exists(
                Match.objects.annotate(
                    total_maps=Count("maps"),
                    requirement_maps=Count(
                        "maps",
                        filter=Q(maps__pk__in=requirement.maps.all()),
                    ),
                    has_requirement_player=Exists(
                        MatchParticipant.objects.filter(
                            match=OuterRef("pk"),
                            team=requirement.reference_player,
                        )
                    ),
                ).filter(
                    requirement_maps=requirement.maps.count(),
                    total_maps=requirement.maps.count(),
                    has_requirement_player=True,
                    participants__team__members=OuterRef("pk"),
                    participants__score__gte=requirement.min_score,
                )
            )
        )

    def export_resumes(self, *, episodes):
        users = list(
            self.annotate(
                rating=Max(
                    "teams__profile__rating__value",
                    filter=Q(teams__episode__in=episodes),
                )
            )
            .filter(profile__has_resume=True, rating__isnull=False)
            .order_by("-rating")
        )
        rank_len = len(str(len({user.rating for user in users})))
        with tempfile.SpooledTemporaryFile() as f:
            with ZipFile(f, "w") as archive:
                rank, last_rating = 0, None
                for user in users:
                    resume = titan.get_object(
                        bucket=settings.GCLOUD_BUCKET_SECURE,
                        name=user.profile.get_resume_path(),
                        check_safety=False,  # TODO: actually check safety, see #628
                        get_raw=True,
                    )
                    if resume["ready"]:
                        if user.rating != last_rating:
                            rank, last_rating = rank + 1, user.rating
                        rank_str = "rank-" + str(rank).zfill(rank_len)
                        user_str = user.first_name + "-" + user.last_name
                        if not user_str.isascii():
                            user_str = "NONASCII-USER"
                        fname = f"{rank_str}-{user_str}.pdf"
                        archive.writestr(fname, resume["data"])

            client = storage.Client(credentials=settings.GCLOUD_CREDENTIALS)
            blob = client.bucket(settings.GCLOUD_BUCKET_EPHEMERAL).blob(
                f"resume-{uuid.uuid4()}.zip"
            )
            # Go back to start of file after archive has finished writing
            f.seek(0)
            with blob.open(
                "wb", content_type="application/zip", predefined_acl="publicRead"
            ) as g:
                g.write(f.read())
            return blob.public_url
