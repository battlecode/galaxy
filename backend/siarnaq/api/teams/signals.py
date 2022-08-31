from django.db.models.signals import pre_save
from django.dispatch import receiver
from siarnaq.api.teams.models import Team
from django.utils.crypto import get_random_string

@receiver(pre_save, sender=Team)
def gen_team_key(sender, instance, raw, update_fields, **kwargs):
    """
    Generate a new team key.
    """
    if not raw and instance._state.adding:
        print('setting new join_key')
        instance.join_key = get_random_string(24)