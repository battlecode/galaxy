# Django Configurations requires its import hooks to be installed before it can be used
# properly. This is a short Mypy plugin to do this, so that Mypy will run successfully.
# See also: https://github.com/typeddjango/django-stubs/pull/180

import os

from configurations import importer
from mypy_django_plugin import main


def plugin(version):
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_project.config")
    os.environ.setdefault("DJANGO_CONFIGURATION", "Local")
    importer.install()
    return main.plugin(version)
