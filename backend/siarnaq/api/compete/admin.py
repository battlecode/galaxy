import structlog
from django.contrib import admin
from django.db.models import Exists, OuterRef
from django.utils.translation import gettext_lazy as _

from siarnaq.api.compete.models import (
    AdminSettings,
    Match,
    MatchParticipant,
    ScrimmageRequest,
    Submission,
)
from siarnaq.api.episodes.models import Map

logger = structlog.get_logger(__name__)


@admin.register(AdminSettings)
class AdminSettingsAdmin(admin.ModelAdmin):
    list_display = ("is_allowed_ranked_scrimmages",)


@admin.action(description="Add pending tasks to the Saturn queue")
def enqueue(modeladmin, request, queryset):
    logger.info("task_requeue", message="Re-queueing tasks to Saturn.")
    queryset.enqueue()


@admin.action(description="Forcibly re-queue tasks to Saturn")
def force_requeue(modeladmin, request, queryset):
    logger.info("task_force_requeue", message="Forcibly re-queuing tasks to Saturn.")
    queryset.enqueue_all()


@admin.action(description="Cancel tasks")
def cancel(modeladmin, request, queryset):
    logger.info("task_cancel", message="Cancelling tasks on Saturn.")
    queryset.cancel()


@admin.action(description="Recalculate ratings")
def recalc_rating(modeladmin, request, queryset):
    logger.info(
        "match_recalc_rating",
        message=f"Recalculate ratings for {len(queryset)} matches. ",
    )
    queryset.request_racalc_ratings()


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    actions = [enqueue, force_requeue, cancel]
    fieldsets = (
        (
            "General",
            {
                "fields": (
                    "team",
                    "user",
                    "episode",
                    "accepted",
                    "package",
                    "description",
                )
            },
        ),
        (
            "Saturn metadata",
            {
                "fields": ("status", "created", "num_failures", "logs"),
            },
        ),
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
    readonly_fields = ("status", "created", "num_failures", "logs")

    def get_readonly_fields(self, request, obj=None):
        fields = super().get_readonly_fields(request, obj=obj)
        if obj is not None:
            fields = ("episode",) + fields
        return fields

    def has_delete_permission(self, request, obj=None):
        return False


class MatchParticipantInline(admin.TabularInline):
    model = MatchParticipant
    extra = 0
    fields = (
        "team",
        "submission",
        "player_index",
        "score",
        "rating",
        "external_id_private",
        "external_id_public",
    )
    max_num = 2
    ordering = ("player_index",)
    raw_id_fields = ("team", "submission")
    readonly_fields = ("rating", "external_id_private", "external_id_public")

    def get_queryset(self, request):
        return (
            super().get_queryset(request).select_related("team", "submission", "rating")
        )


class RatingNullFilter(admin.SimpleListFilter):
    title = _("Rating is null")
    parameter_name = "rating_is_null"

    def lookups(self, request, model_admin):
        return (
            ("yes", _("Yes")),
            ("no", _("No")),
        )

    def queryset(self, request, queryset):
        # did this Exists trick to prevent getting duplicates from the join
        if self.value() == "yes":
            return queryset.annotate(
                rating_is_null=Exists(
                    MatchParticipant.objects.filter(
                        match=OuterRef("pk"), rating__isnull=True
                    )
                )
            ).filter(rating_is_null=True)
        if self.value() == "no":
            return queryset.annotate(
                rating_is_null=Exists(
                    MatchParticipant.objects.filter(
                        match=OuterRef("pk"), rating__isnull=True
                    )
                )
            ).filter(rating_is_null=False)
        return queryset


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    actions = [enqueue, force_requeue, cancel, recalc_rating]
    fieldsets = (
        (
            "General",
            {
                "fields": (
                    "episode",
                    "replay",
                    "alternate_order",
                    "is_ranked",
                    "maps",
                )
            },
        ),
        (
            "Saturn metadata",
            {
                "fields": ("status", "created", "num_failures", "logs"),
            },
        ),
        (
            "Tournament metadata",
            {
                "fields": (
                    "tournament_round",
                    "external_id_private",
                    "external_id_public",
                ),
            },
        ),
    )
    inlines = [MatchParticipantInline]
    list_display = (
        "__str__",
        "episode",
        "tournament_round",
        "status",
        "created",
        "is_ranked",
    )
    list_filter = ("episode", "status", "is_ranked", RatingNullFilter)
    ordering = ("-pk",)
    raw_id_fields = ("tournament_round",)
    readonly_fields = (
        "replay",
        "status",
        "created",
        "num_failures",
        "logs",
        "external_id_private",
        "external_id_public",
    )

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        pk = request.resolver_match.kwargs.get("object_id", None)
        if db_field.name == "maps" and pk is not None:
            kwargs["queryset"] = Map.objects.filter(episode__matches=pk)
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def get_readonly_fields(self, request, obj=None):
        fields = super().get_readonly_fields(request, obj=obj)
        if obj is not None:
            fields = ("episode",) + fields
        return fields

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
        "requested_by",
        "requested_to",
        "episode",
        "created",
        "status",
        "player_order",
        "is_ranked",
        "maps",
    )
    list_display = (
        "pk",
        "requested_by",
        "requested_to",
        "episode",
        "status",
        "is_ranked_no_icon",
    )
    list_filter = ("episode", "status", "is_ranked")
    list_select_related = ("requested_by", "requested_to", "episode")
    ordering = ("-pk",)
    raw_id_fields = ("requested_by", "requested_to")
    readonly_fields = ("created", "status")

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        pk = request.resolver_match.kwargs.get("object_id", None)
        if db_field.name == "maps" and pk is not None:
            kwargs["queryset"] = Map.objects.filter(episode__scrimmage_requests=pk)
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def get_readonly_fields(self, request, obj=None):
        fields = super().get_readonly_fields(request, obj=obj)
        if obj is not None:
            fields = ("episode",) + fields
        return fields

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="Is ranked")
    def is_ranked_no_icon(self, obj):
        """
        Return whether a request is for a ranked match. Using this field disables the
        prettified boolean icons for boolean fields, as they do not make sense here.
        """
        return obj.is_ranked
