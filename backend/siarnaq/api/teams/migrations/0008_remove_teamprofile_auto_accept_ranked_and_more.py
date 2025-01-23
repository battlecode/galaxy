# Generated by Django 4.1.2 on 2025-01-23 07:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("teams", "0007_teamprofile_has_report"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="teamprofile",
            name="auto_accept_ranked",
        ),
        migrations.RemoveField(
            model_name="teamprofile",
            name="auto_accept_unranked",
        ),
        migrations.AddField(
            model_name="teamprofile",
            name="auto_accept_reject_ranked",
            field=models.CharField(
                choices=[("A", "Auto Accept"), ("R", "Auto Reject"), ("M", "Manual")],
                default="M",
                max_length=1,
            ),
        ),
        migrations.AddField(
            model_name="teamprofile",
            name="auto_accept_reject_unranked",
            field=models.CharField(
                choices=[("A", "Auto Accept"), ("R", "Auto Reject"), ("M", "Manual")],
                default="M",
                max_length=1,
            ),
        ),
    ]
