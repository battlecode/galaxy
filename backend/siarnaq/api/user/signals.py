import urllib.parse

import structlog
from django.conf import settings
from django.core.mail import send_mail
from django.dispatch import receiver
from django.template.loader import render_to_string
from django_rest_passwordreset.signals import reset_password_token_created

logger = structlog.get_logger(__name__)


@receiver(reset_password_token_created)
def send_password_reset_token_email(
    sender, instance, reset_password_token, *args, **kwargs
):
    """
    When a token is created, send an email to the user.
    See https://github.com/anexia-it/django-rest-passwordreset/blob/master/README.md.
    """

    if not settings.EMAIL_ENABLED:
        logger.warn("password_disabled", message="Password reset emails are disabled.")
        return

    logger.info("password_email", message="Sending password reset email.")
    user_email = reset_password_token.user.email
    uri = f"{settings.FRONTEND_ORIGIN}/password_change/"
    token_encoded = urllib.parse.urlencode({"token": reset_password_token.key})
    context = {
        "username": reset_password_token.user.username,
        "reset_password_url": f"{uri}?{token_encoded}",
    }
    email_html_message = render_to_string("password_reset.html", context)

    send_mail(
        subject="MIT Battlecode: Password Reset",
        # both message and html_message are necessary;
        # html_message renders as nice html
        # but message is required (by the email package and by protocol)
        # as a fallback
        message=email_html_message,
        html_message=email_html_message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user_email],
        fail_silently=False,
    )
