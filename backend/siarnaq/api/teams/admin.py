from django.contrib import admin

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
    readonly_fields = ("rating", "has_avatar")


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    fields = (("name",), ("episode",), ("status", "join_key"), ("members",))
    inlines = [TeamProfileInline]
    list_display = ("name", "episode", "rating")
    list_select_related = ("episode", "profile__rating")
    raw_id_fields = ("members",)
    readonly_fields = ("join_key",)
    search_fields = ("name",)
    search_help_text = "Search for a team name."

    @admin.display()
    def rating(self, obj):
        return obj.profile.rating
