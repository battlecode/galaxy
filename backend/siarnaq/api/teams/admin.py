from django.contrib import admin

from siarnaq.api.teams.models import Team, TeamProfile


class TeamProfileInline(admin.StackedInline):
    model = TeamProfile
    fields = (
        ("quote",),
        ("biography",),
        ("rating_value", "has_avatar"),
        ("auto_accept_ranked", "auto_accept_unranked"),
        ("eligible_for",),
    )
    readonly_fields = ("rating_value", "has_avatar")

    @admin.display()
    def rating_value(self, obj):
        return obj.rating.to_value()


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    fields = (("name",), ("episode",), ("status", "join_key"), ("members",))
    inlines = [TeamProfileInline]
    list_display = ("name", "episode_name_short", "rating_value")
    list_select_related = ("episode", "profile__rating")
    raw_id_fields = ("members",)
    readonly_fields = ("join_key",)
    search_fields = ("name",)
    search_help_text = "Search for a team name."

    @admin.display()
    def episode_name_short(self, obj):
        return obj.episode.name_short

    @admin.display()
    def rating_value(self, obj):
        return obj.profile.rating.to_value()
