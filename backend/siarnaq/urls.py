"""siarnaq URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from siarnaq.api import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/", include("siarnaq.api.user.urls")),
    path("api/compete/", include("siarnaq.api.compete.urls")),
    path("api/episode/", include("siarnaq.api.episodes.urls")),
    path("api/team/", include("siarnaq.api.teams.urls")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Schema:
    path("api/specs/", SpectacularAPIView.as_view(), name="specs"),
    path(
        "api/specs/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="specs"),
        name="swagger-ui",
    ),
    # Misc:
    path("api/ping/", views.ping, name="ping"),
    path("api/version/", views.version, name="version"),
]
