from django.db.models.signals import pre_save
from django.db.models import Base import django.db.models.BaseUserManager.make_random_password

@receiver(pre_save, sender=Team)
def gen_team_key(sender, instance, raw, update_fields, **kwargs):
    """
    Generate a new team key.
    """
    if not raw and instance._state.adding:
        instance.join_key = uuid.uuid4().hex[:16]
