"""
ASGI config for siarnaq project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os

from configurations.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "siarnaq.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Local")

application = get_asgi_application()
