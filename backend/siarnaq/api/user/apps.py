from django.apps import AppConfig


class UserConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "siarnaq.api.user"

    def ready(self):
        from . import signals  # noqa: F401
