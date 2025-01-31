from django.contrib import admin
from import_export.admin import ExportMixin

from siarnaq.api.teams.models import ClassRequirement, Team, TeamProfile


class TeamProfileInline(admin.StackedInline):
    model = TeamProfile
    fields = (
        "quote",
        "biography",
        "auto_accept_reject_ranked",
        "auto_accept_reject_unranked",
        "rating",
        "has_avatar",
        "eligible_for",
    )
    filter_horizontal = ("eligible_for",)
    readonly_fields = ("rating", "has_avatar")

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("rating")
            .prefetch_related("eligible_for")
        )

    def has_delete_permission(self, request, obj):
        return False


@admin.register(Team)
class TeamAdmin(ExportMixin, admin.ModelAdmin):
    fields = ("name", "episode", "status", "members", "join_key")
    inlines = [TeamProfileInline]
    list_display = ("name", "episode", "rating", "status")
    list_filter = ("episode",)
    list_select_related = ("episode", "profile__rating")
    ordering = ("-episode__game_release", "name")
    raw_id_fields = ("members",)
    readonly_fields = ("join_key",)
    search_fields = ("name",)
    search_help_text = "Search for a team name."

    def get_readonly_fields(self, request, obj=None):
        fields = super().get_readonly_fields(request, obj=obj)
        if obj is not None:
            fields = ("episode",) + fields
        return fields

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(ordering="profile__rating__value")
    def rating(self, obj):
        return obj.profile.rating


@admin.register(ClassRequirement)
class ClassRequirementAdmin(admin.ModelAdmin):
    fields = ("episode", "reference_player", "maps", "min_score")
    filter_horizontal = ("maps",)
    list_display = ("episode", "reference_player", "total_maps", "min_score")
    raw_id_fields = ("reference_player",)

    @admin.display()
    def total_maps(self, obj):
        return obj.maps.count()
