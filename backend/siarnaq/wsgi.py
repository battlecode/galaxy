"""
WSGI config for siarnaq project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "siarnaq.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Local")

from configurations.wsgi import get_wsgi_application  # noqa: E402

application = get_wsgi_application()
