import tempfile
from zipfile import ZipFile

import structlog
from django.conf import settings
from django.contrib import admin, messages
from django.db.models import Max, Q
from django.http import HttpResponse
from django.utils.html import format_html

from siarnaq.api.compete.models import Match
from siarnaq.api.episodes.models import (
    EligibilityCriterion,
    Episode,
    Map,
    Tournament,
    TournamentRound,
)
from siarnaq.api.user.models import User
from siarnaq.gcloud import titan

logger = structlog.get_logger(__name__)


@admin.action(description="Export all submitted resumes")
def export_resumes(modeladmin, request, queryset):
    users = list(
        User.objects.annotate(
            rating=Max(
                "teams__profile__rating__value", filter=Q(teams__episode__in=queryset)
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
                if user.rating != last_rating:
                    rank, last_rating = rank + 1, user.rating
                rank_str = "rank-" + str(rank).zfill(rank_len)
                user_str = user.first_name + "-" + user.last_name
                if not user_str.isascii():
                    user_str = "nonascii-user"
                fname = f"{rank_str}-{user_str}.pdf"
                resume = titan.get_object(
                    bucket=settings.GCLOUD_BUCKET_SECURE,
                    name=user.profile.get_resume_path(),
                    check_safety=False,  # TODO: actually check safety, see #628
                    get_raw=True,
                )
                if resume["ready"]:
                    archive.writestr(fname, resume["data"])
        f.seek(0)
        response = HttpResponse(f.read(), content_type="application/x-zip-compressed")
        response["Content-Disposition"] = "attachment; filename=resumes.zip"
        return response


class MapInline(admin.TabularInline):
    model = Map
    extra = 0
    fields = ("name", "is_public")
    ordering = ("name",)


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    actions = [export_resumes]
    fieldsets = (
        (
            "General",
            {
                "fields": (
                    "name_short",
                    "name_long",
                    "language",
                    "blurb",
                    "eligibility_criteria",
                ),
            },
        ),
        (
            "Distribution",
            {
                "fields": (
                    "scaffold",
                    "artifact_name",
                    "release_version_public",
                    "release_version_saturn",
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
    fields = ("name", "maps", "external_id", "release_status")
    ordering = (
        "display_order",
        "external_id",
    )
    raw_id_fields = ("maps",)
    readonly_fields = ("external_id",)

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("maps")


@admin.action(description="Initialize a tournament")
def initialize(modeladmin, request, queryset):
    logger.info("initialize", message="Initializing tournaments.")
    for tournament in queryset:
        tournament.initialize()


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    actions = [initialize]
    fieldsets = (
        (
            "General",
            {"fields": ("name_short", "name_long", "episode", "style", "blurb")},
        ),
        (
            "Release options",
            {
                "fields": (
                    "submission_freeze",
                    "submission_unfreeze",
                    "display_date",
                    "is_public",
                ),
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
            "Bracket service configuration",
            {
                "fields": (
                    "external_id_private",
                    "external_id_public",
                ),
            },
        ),
    )
    filter_horizontal = ("eligibility_includes", "eligibility_excludes")
    inlines = [TournamentRoundInline]
    list_display = (
        "name_short",
        "name_long",
        "episode",
        "display_date",
        "submission_freeze",
        "is_public",
    )
    list_filter = ("episode",)
    list_select_related = ("episode",)
    ordering = ("-episode__game_release", "-submission_freeze")
    search_fields = ("name_short", "name_long")
    search_help_text = "Search for a full or abbreviated name."


class MatchInline(admin.TabularInline):
    model = Match
    classes = ("collapse",)
    extra = 0
    fields = ("__str__", "created", "replay_link", "status")
    ordering = ("-pk",)
    readonly_fields = fields

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("participants__team")

    def has_add_permission(self, request, obj):
        return False

    def has_delete_permission(self, request, obj):
        return False

    @admin.display(description="Replay link")
    def replay_link(self, obj):
        link = "https://releases.battlecode.org/client/{}/{}/visualizer.html?{}".format(
            obj.episode.artifact_name,
            obj.episode.release_version_public,
            # Client should make this something urlencode-able, instead of the below...
            "tournamentMode&" + obj.get_replay_url(),
        )
        return format_html('<a href="{}">Watch</a>', link)


@admin.action(description="Create and enqueue matches")
def enqueue(modeladmin, request, queryset):
    logger.info("round_enqueue", message="Enqueueing tournament rounds.")
    for round in queryset:
        try:
            round.enqueue()
        except RuntimeError as e:
            messages.error(request, str(e))


@admin.action(description="Release results to public bracket service")
def release_to_public_bracket(modeladmin, request, queryset):
    logger.info("round_release", message="Releasing to public bracket.")
    for round in queryset:
        round.request_publish_to_bracket(is_public=False)


@admin.register(TournamentRound)
class TournamentRoundAdmin(admin.ModelAdmin):
    actions = [enqueue, release_to_public_bracket]
    fields = (
        "name",
        "tournament",
        "external_id",
        "release_status",
        "maps",
        "in_progress",
    )
    inlines = [MatchInline]
    list_display = (
        "name",
        "external_id",
        "tournament",
        "release_status",
        "in_progress",
    )
    list_filter = ("tournament", "release_status")
    list_select_related = ("tournament",)
    ordering = ("-tournament__submission_freeze", "display_order", "external_id")
    readonly_fields = ("external_id", "in_progress")

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("tournament")
            .prefetch_related("matches__episode")
        )

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        pk = request.resolver_match.kwargs.get("object_id", None)
        if db_field.name == "maps" and pk is not None:
            kwargs["queryset"] = Map.objects.filter(episode__tournaments__rounds=pk)
        return super().formfield_for_manytomany(db_field, request, **kwargs)
