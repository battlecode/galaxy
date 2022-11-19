from django.conf import settings
from django.core.mail import send_mail
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created


@receiver(reset_password_token_created)
def password_reset_token_created(
    sender, instance, reset_password_token, *args, **kwargs
):
    """
    When a token is created, send an email to the user.
    See https://github.com/anexia-it/django-rest-passwordreset/blob/master/README.md.
    """
    user_email = reset_password_token.user.email
    context = {
        "username": reset_password_token.user.username,
        "reset_password_url": "{}?token={}".format(
            instance.request.build_absolute_uri(
                reverse("password_reset:reset-password-confirm")
            ),
            reset_password_token.key,
        ),
    }
    email_html_message = render_to_string("../templates/password_reset.html", context)

    send_mail(
        # title:
        "Battlecode Password Reset Token",
        # message:
        email_html_message,
        # from:
        settings.EMAIL_HOST_USER,
        # to:
        [user_email],
    )
