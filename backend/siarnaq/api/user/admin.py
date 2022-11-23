from django.contrib import admin

from siarnaq.api.teams.models import Team
from siarnaq.api.user.models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    fields = (
        ("school", "kerberos"),
        ("biography",),
        ("gender", "gender_details"),
        ("has_avatar", "has_resume"),
        ("country",),
    )
    readonly_fields = ("has_avatar", "has_resume")


class TeamInline(admin.TabularInline):
    model = Team.members.through
    fields = ("team", "episode")
    extra = 0
    ordering = ("-team__episode__game_release",)
    readonly_fields = fields
    raw_id_fields = ("team",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("team__episode")

    def has_add_permission(self, request, obj):
        return False

    def has_delete_permission(self, request, obj):
        return False

    @admin.display()
    def episode(self, obj):
        return obj.team.episode


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fields = (
        ("username",),
        ("first_name", "last_name"),
        ("email"),
        ("is_active",),
        ("is_staff",),
        ("is_superuser",),
        ("last_login", "date_joined"),
        ("groups",),
    )
    inlines = [UserProfileInline, TeamInline]
    list_display = ("username", "first_name", "last_name", "email", "is_staff")
    list_filter = ("is_staff",)
    ordering = ("username",)
    readonly_fields = ("last_login", "date_joined")
    search_fields = ("username", "first_name", "last_name", "email")
    search_help_text = "Search for a username, name or email."
