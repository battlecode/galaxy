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
        "team_name",
        "episode_name_short",
        "accepted",
        "status",
        "created",
    )
    list_select_related = ("team", "user", "episode")
    raw_id_fields = ("team", "user")
    readonly_fields = (
        "team_name",
        "user_username",
        "episode_name_short",
        "status",
        "created",
    )

    @admin.display()
    def team_name(self, obj):
        return obj.team.name

    @admin.display()
    def user_username(self, obj):
        return obj.user.username

    @admin.display()
    def episode_name_short(self, obj):
        return obj.episode.name_short


class MatchParticipantInline(admin.StackedInline):
    model = MatchParticipant
    extra = 0
    fields = (
        ("team", "submission"),
        ("player_index", "score", "rating_value"),
    )
    raw_id_fields = ("team", "submission")
    readonly_fields = (
        "player_index",
        "rating_value",
    )

    @admin.display()
    def rating_value(self, obj):
        return obj.rating.to_value()


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
        "participants_list",
        "episode_name_short",
        "tournament",
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

    @admin.display()
    def episode_name_short(self, obj):
        return obj.episode.name_short

    @admin.display()
    def participants_list(self, obj):
        return [participant.team.name for participant in obj.participants.all()]

    @admin.display()
    def tournament(self, obj):
        if obj.tournament_round_id is None:
            return None
        r = obj.tourmanent_round
        return f"{r.tournament.name_short} (r.name)"


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
        "requested_by_name",
        "requested_to_name",
        "episode_name_short",
        "status",
        "is_ranked",
    )
    list_select_related = ("requested_by", "requested_to", "episode")
    raw_id_fields = ("requested_by", "requested_to", "maps")
    readonly_fields = ("created", "status")

    @admin.display()
    def requested_by_name(self, obj):
        return obj.requested_by.name

    @admin.display()
    def requested_to_name(self, obj):
        return obj.requested_to.name

    @admin.display()
    def episode_name_short(self, obj):
        return obj.episode.name_short
