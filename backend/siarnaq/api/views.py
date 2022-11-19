from django.http import HttpResponse
from rest_framework import status


def ping(request):
    """Check that the server is alive."""
    return HttpResponse("pong")


def version(request):
    """Return the current version of the server."""
    return HttpResponse("unimplemented", status=status.HTTP_503_SERVICE_UNAVAILABLE)
