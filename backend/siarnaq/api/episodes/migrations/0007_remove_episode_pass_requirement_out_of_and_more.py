# Generated by Django 4.1.2 on 2023-01-27 03:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("episodes", "0006_tournamentround_display_order"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="episode",
            name="pass_requirement_out_of",
        ),
        migrations.RemoveField(
            model_name="episode",
            name="pass_requirement_win",
        ),
    ]
