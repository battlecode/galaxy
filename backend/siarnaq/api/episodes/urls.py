from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

urlpatterns = [
    path("", views.NewTest, name='new'),
]
