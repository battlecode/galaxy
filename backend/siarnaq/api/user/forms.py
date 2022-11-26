from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm
from django.contrib.auth.forms import UsernameField

from siarnaq.api.user.models import User


class UserCreationForm(BaseUserCreationForm):
    class Meta:
        model = User
        fields = ("username", "email")
        field_classes = {"username": UsernameField}
