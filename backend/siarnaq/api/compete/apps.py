from django.apps import AppConfig


class CompeteConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "siarnaq.api.compete"

    def ready(self):
        from . import signals  # noqa: F401
