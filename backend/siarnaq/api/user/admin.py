from django.contrib import admin

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
    inlines = [UserProfileInline]
    list_display = ("username", "first_name", "last_name", "email")
    readonly_fields = ("last_login", "date_joined")
    search_fields = ("username", "first_name", "last_name", "email")
    search_help_text = "Search for a username, name or email."
