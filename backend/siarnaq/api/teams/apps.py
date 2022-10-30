from django.apps import AppConfig


class TeamsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "siarnaq.api.teams"

    def ready(self):
        from . import signals  # noqa: F401
