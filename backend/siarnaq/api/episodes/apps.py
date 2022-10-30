from django.apps import AppConfig


class EpisodesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "siarnaq.api.episodes"

    def ready(self):
        from . import signals  # noqa: F401
