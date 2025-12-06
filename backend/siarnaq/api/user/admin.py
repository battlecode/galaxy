from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from import_export.admin import ExportMixin

from siarnaq.api.teams.models import Team
from siarnaq.api.user.forms import UserCreationForm
from siarnaq.api.user.models import EmailVerificationToken, User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    fields = (
        "school",
        "kerberos",
        "biography",
        "country",
        "has_avatar",
        "has_resume",
    )
    readonly_fields = ("has_avatar", "has_resume")

    def has_delete_permission(self, request, obj):
        return False


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
class UserAdmin(ExportMixin, BaseUserAdmin):
    add_form = UserCreationForm
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )
    inlines = [UserProfileInline, TeamInline]
    readonly_fields = ("last_login", "date_joined")

    def get_inlines(self, request, obj=None, **kwargs):
        if obj is None:
            return []
        return super().get_inlines(request, obj, **kwargs)

    def get_form(self, request, obj=None, **kwargs):
        """Disable form fields that grant too much power."""
        # See: https://realpython.com/manage-users-in-django-admin/
        form = super().get_form(request, obj, **kwargs)
        is_superuser = request.user.is_superuser
        disabled_fields: set[str] = set()

        if not is_superuser:
            # Non-superusers cannot grant themselves superuser access.
            # Disable user_permissions to configure entirely via groups.
            disabled_fields |= {"is_superuser", "user_permissions"}

        if not is_superuser and obj is not None and obj == request.user:
            # Users cannot change their own access.
            disabled_fields |= {
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            }

        for f in disabled_fields:
            if f in form.base_fields:
                form.base_fields[f].disabled = True
        return form

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Admin interface for email verification tokens."""

    list_display = ("user", "token", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "user__email", "token")
    readonly_fields = ("user", "token", "created_at")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False
