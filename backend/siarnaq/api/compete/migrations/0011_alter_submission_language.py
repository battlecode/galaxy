# Generated manually on 2025-12-31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("episodes", "0014_migrate_language_to_m2m"),
        ("compete", "0010_submission_language"),
    ]

    operations = [
        migrations.AlterField(
            model_name="submission",
            name="language",
            field=models.ForeignKey(
                help_text="The programming language of this submission.",
                on_delete=django.db.models.deletion.PROTECT,
                related_name="submissions",
                to="episodes.programminglanguage",
            ),
        ),
    ]
