from django.contrib import admin

from siarnaq.api.compete.models import (
    Match,
    MatchParticipant,
    ScrimmageRequest,
    Submission,
)


@admin.action(description="Add pending tasks to the Saturn queue")
def enqueue(modeladmin, request, queryset):
    queryset.enqueue()


@admin.action(description="Forcibly re-queue tasks to Saturn")
def force_requeue(modeladmin, request, queryset):
    queryset.enqueue_all()


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    actions = [enqueue, force_requeue]
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
    list_filter = ("episode", "accepted", "status")
    list_select_related = ("team", "episode")
    ordering = ("-pk",)
    raw_id_fields = ("team", "user")
    readonly_fields = (
        "status",
        "created",
    )

    def has_delete_permission(self, request, obj=None):
        return False


class MatchParticipantInline(admin.StackedInline):
    model = MatchParticipant
    extra = 0
    fields = (
        ("team", "submission"),
        ("player_index", "score", "rating"),
    )
    ordering = ("player_index",)
    raw_id_fields = ("team", "submission")
    readonly_fields = ("rating",)

    def get_queryset(self, request):
        return (
            super().get_queryset(request).select_related("team", "submission", "rating")
        )


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    actions = [enqueue, force_requeue]
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
        "__str__",
        "episode",
        "tournament_round",
        "status",
        "created",
    )
    list_filter = ("episode", "status")
    ordering = ("-pk",)
    raw_id_fields = ("tournament_round", "maps")
    readonly_fields = ("replay", "status", "created")

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("episode", "tournament_round__tournament")
            .prefetch_related("participants__team")
        )

    def has_delete_permission(self, request, obj=None):
        return False


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
    list_filter = ("episode", "status", "is_ranked")
    list_select_related = ("requested_by", "requested_to", "episode")
    ordering = ("-pk",)
    raw_id_fields = ("requested_by", "requested_to", "maps")
    readonly_fields = ("created", "status")

    def has_delete_permission(self, request, obj=None):
        return False
