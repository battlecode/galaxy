# Generated by Django 4.1.2 on 2025-01-13 21:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("episodes", "0009_alter_episode_language"),
    ]

    operations = [
        migrations.AddField(
            model_name="episode",
            name="is_allowed_ranked_scrimmage",
            field=models.BooleanField(default=True),
        ),
    ]
