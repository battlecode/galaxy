from django.contrib import admin

from siarnaq.api.compete.models import MatchParticipant, Submission
from siarnaq.api.teams.models import Team, TeamProfile


class TeamProfileInline(admin.StackedInline):
    model = TeamProfile
    fields = (
        ("quote",),
        ("biography",),
        ("rating", "has_avatar"),
        ("auto_accept_ranked", "auto_accept_unranked"),
        ("eligible_for",),
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


class SubmissionInline(admin.TabularInline):
    model = Submission
    classes = ["collapse"]
    extra = 0
    fields = ("created", "accepted", "status")
    ordering = ("-pk",)
    readonly_fields = fields

    def has_add_permission(self, request, obj):
        return False

    def has_delete_permission(self, request, obj):
        return False


class MatchParticipantInline(admin.TabularInline):
    model = MatchParticipant
    classes = ("collapse",)
    extra = 0
    fields = ("match", "replay", "submission", "score", "rating", "status")
    ordering = ("-pk",)
    readonly_fields = fields

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related("match__participants__team", "submission", "rating")
        )

    def has_add_permission(self, request, obj):
        return False

    def has_delete_permission(self, request, obj):
        return False

    @admin.display()
    def replay(self, obj):
        return obj.match.replay

    @admin.display()
    def status(self, obj):
        return obj.match.get_status_display()


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    fields = (("name",), ("episode",), ("status", "join_key"), ("members",))
    inlines = [TeamProfileInline, SubmissionInline, MatchParticipantInline]
    list_display = ("name", "episode", "rating")
    list_filter = ("episode",)
    list_select_related = ("episode", "profile__rating")
    ordering = ("-episode__game_release", "name")
    raw_id_fields = ("members",)
    readonly_fields = ("join_key",)
    search_fields = ("name",)
    search_help_text = "Search for a team name."

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(ordering="profile__rating__value")
    def rating(self, obj):
        return obj.profile.rating
