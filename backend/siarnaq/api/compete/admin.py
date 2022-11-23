from django.contrib import admin

from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    ScrimmageRequest,
    Submission,
)


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    fields = (
        ("team", "user"),
        ("episode", "created"),
        ("status",),
        ("accepted",),
        ("package", "description"),
        ("logs",),
    )
    list_display = (
        "pk",
        "team",
        "episode",
        "accepted",
        "status",
        "created",
    )
    list_select_related = ("team", "user", "episode")
    raw_id_fields = ("team", "user")
    readonly_fields = (
        "status",
        "created",
    )


class MatchParticipantInline(admin.StackedInline):
    model = MatchParticipant
    extra = 0
    fields = (
        ("team", "submission"),
        ("player_index", "score", "rating"),
    )
    raw_id_fields = ("team", "submission")
    readonly_fields = (
        "player_index",
        "rating",
    )


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    fields = (
        ("episode", "tournament_round"),
        ("replay", "created"),
        ("status",),
        ("alternate_order", "is_ranked"),
        ("maps",),
        ("logs",),
    )
    inlines = [MatchParticipantInline]
    list_display = (
        "pk",
        "__str__",
        "episode",
        "tournament_round",
        "status",
        "created",
    )
    raw_id_fields = ("tournament_round", "maps")
    readonly_fields = ("replay", "status", "created")

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("episode", "tournament_round__tournament")
            .prefetch_related("participants__team")
        )


@admin.register(ScrimmageRequest)
class ScrimmageRequestAdmin(admin.ModelAdmin):
    fields = (
        ("requested_by", "requested_to"),
        ("episode", "created", "status"),
        ("player_order", "is_ranked"),
        ("maps",),
    )
    list_display = (
        "pk",
        "requested_by",
        "requested_to",
        "episode",
        "status",
        "is_ranked",
    )
    list_select_related = ("requested_by", "requested_to", "episode")
    raw_id_fields = ("requested_by", "requested_to", "maps")
    readonly_fields = ("created", "status")
