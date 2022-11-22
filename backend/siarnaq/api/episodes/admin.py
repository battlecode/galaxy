from django.contrib import admin

from siarnaq.api.episodes.models import (
    EligibilityCriterion,
    Episode,
    Map,
    Tournament,
    TournamentRound,
)


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "General",
            {
                "fields": (
                    ("name_short", "name_long", "blurb"),
                    ("language", "release_version"),
                ),
            },
        ),
        (
            "Release options",
            {
                "fields": ("registration", "game_release", "game_archive"),
            },
        ),
        (
            "Match management",
            {
                "fields": ("submission_frozen", "autoscrim_schedule"),
            },
        ),
        (
            "Academic requirements",
            {
                "fields": ("pass_requirement_win", "pass_requirement_out_of"),
            },
        ),
    )
    list_display = ("name_short", "name_long", "game_release")
    search_fields = ("name_short", "name_long")
    search_help_text = "Search for a full or abbreviated name."


@admin.register(Map)
class MapAdmin(admin.ModelAdmin):
    fields = ("name", "episode", "is_public")
    list_display = ("name", "episode_name_short", "is_public")
    list_select_related = ("episode",)
    search_fields = ("name",)
    search_help_text = "Search for a map name."

    @admin.display()
    def episode_name_short(self, obj):
        return obj.episode.name_short


@admin.register(EligibilityCriterion)
class EligibilityCriterionAdmin(admin.ModelAdmin):
    fields = (("question",), ("episode", "icon"))
    list_display = ("question", "episode_name_short", "icon")
    list_select_related = ("episode",)
    search_fields = ("question",)
    search_help_text = "Search for a question."

    @admin.display()
    def episode_name_short(self, obj):
        return obj.episode.name_short


class TournamentRoundInline(admin.StackedInline):
    model = TournamentRound
    extra = 0
    fields = (
        ("name", "challonge_id"),
        ("maps", "is_released"),
    )
    raw_id_fields = ("maps",)
    readonly_fields = ("challonge_id",)


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "General",
            {"fields": (("name_short", "name_long"), ("episode", "style"), ("blurb",))},
        ),
        (
            "Release options",
            {
                "fields": ("submission_freeze", "submission_unfreeze", "is_public"),
            },
        ),
        (
            "Eligibility options",
            {
                "fields": (
                    "eligibility_includes",
                    "eligibility_excludes",
                    "require_resume",
                ),
            },
        ),
        (
            "Challonge configuration",
            {
                "fields": ("challonge_private", "challonge_public", "in_progress"),
            },
        ),
    )
    inlines = [TournamentRoundInline]
    list_display = (
        "name_short",
        "name_long",
        "episode_name_short",
        "submission_freeze",
        "in_progress",
    )
    list_select_related = ("episode",)
    readonly_fields = ("in_progress",)
    search_fields = ("name_short", "name_long")
    search_help_text = "Search for a full or abbreviated name."

    @admin.display()
    def episode_name_short(self, obj):
        return obj.episode.name_short
