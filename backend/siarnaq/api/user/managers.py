from django.contrib.auth.models import UserManager as DjangoUserManager
from django.db.models import Count, Exists, OuterRef, Q


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
