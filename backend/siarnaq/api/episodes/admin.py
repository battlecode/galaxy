from django.contrib import admin

from siarnaq.api.compete.models import Match
from siarnaq.api.episodes.models import (
    EligibilityCriterion,
    Episode,
    Map,
    Tournament,
    TournamentRound,
)


class MapInline(admin.TabularInline):
    model = Map
    extra = 0
    fields = ("name", "is_public")
    ordering = ("name",)


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "General",
            {
                "fields": (
                    "name_short",
                    "name_long",
                    "language",
                    "release_version",
                    "blurb",
                    "eligibility_criteria",
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
    filter_horizontal = ("eligibility_criteria",)
    inlines = [MapInline]
    list_display = (
        "name_short",
        "name_long",
        "registration",
        "game_release",
        "game_archive",
    )
    ordering = ("-game_release",)
    search_fields = ("name_short", "name_long")
    search_help_text = "Search for a full or abbreviated name."


@admin.register(Map)
class MapAdmin(admin.ModelAdmin):
    fields = ("name", "episode", "is_public")
    list_display = ("name", "episode", "is_public")
    list_filter = ("episode", "is_public")
    list_select_related = ("episode",)
    ordering = ("-episode__game_release", "name")
    search_fields = ("name",)
    search_help_text = "Search for a map name."


@admin.register(EligibilityCriterion)
class EligibilityCriterionAdmin(admin.ModelAdmin):
    fields = ("title", "description", "icon")
    list_display = ("title", "icon")
    ordering = ("title",)
    search_fields = ("title",)
    search_help_text = "Search for a title."


class TournamentRoundInline(admin.TabularInline):
    model = TournamentRound
    extra = 0
    fields = ("name", "maps", "challonge_id", "release_status")
    ordering = ("challonge_id",)
    raw_id_fields = ("maps",)
    readonly_fields = ("challonge_id",)

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("maps")


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "General",
            {"fields": ("name_short", "name_long", "episode", "style", "blurb")},
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
    filter_horizontal = ("eligibility_includes", "eligibility_excludes")
    inlines = [TournamentRoundInline]
    list_display = (
        "name_short",
        "name_long",
        "episode",
        "submission_freeze",
        "is_public",
        "in_progress",
    )
    list_filter = ("episode",)
    list_select_related = ("episode",)
    ordering = ("-episode__game_release", "-submission_freeze")
    readonly_fields = ("in_progress",)
    search_fields = ("name_short", "name_long")
    search_help_text = "Search for a full or abbreviated name."


class MatchInline(admin.TabularInline):
    model = Match
    classes = ("collapse",)
    extra = 0
    fields = ("__str__", "created", "replay", "status")
    ordering = ("-pk",)
    readonly_fields = fields

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("participants__team")

    def has_add_permission(self, request, obj):
        return False

    def has_delete_permission(self, request, obj):
        return False


@admin.register(TournamentRound)
class TournamentRoundAdmin(admin.ModelAdmin):
    fields = (
        "name",
        "challonge_id",
        "release_status",
        "maps",
    )
    filter_horizontal = ("maps",)
    inlines = [MatchInline]
    list_display = ("name", "tournament", "release_status")
    list_filter = ("tournament", "release_status")
    list_select_related = ("tournament",)
    ordering = ("-tournament__submission_freeze", "challonge_id")
    readonly_fields = ("challonge_id",)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        pk = request.resolver_match.kwargs.get("object_id", None)
        if db_field.name == "maps" and pk is not None:
            kwargs["queryset"] = Map.objects.filter(episode__tournaments__rounds=pk)
        return super().formfield_for_manytomany(db_field, request, **kwargs)
