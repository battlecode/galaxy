# Generated by Django 4.0.6 on 2022-07-30 19:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('episodes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mean', models.FloatField(default=0.0)),
                ('deviation', models.FloatField(default=2.0)),
                ('volatility', models.FloatField(default=0.06)),
                ('updated', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=32)),
                ('join_key', models.SlugField(max_length=24)),
                ('status', models.CharField(choices=[('R', 'Regular'), ('X', 'Inactive'), ('S', 'Staff'), ('O', 'Invisible')], default='R', max_length=1)),
                ('episode', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='teams', to='episodes.episode')),
                ('members', models.ManyToManyField(related_name='teams', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='EligibilityCriterion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.TextField()),
                ('icon', models.CharField(max_length=8)),
                ('episode', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='eligibility_criteria', to='episodes.episode')),
            ],
        ),
        migrations.CreateModel(
            name='TeamProfile',
            fields=[
                ('team', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, primary_key=True, related_name='profile', serialize=False, to='teams.team')),
                ('quote', models.CharField(blank=True, max_length=80)),
                ('biography', models.TextField(blank=True, max_length=1024)),
                ('has_avatar', models.BooleanField(default=False)),
                ('auto_accept_ranked', models.BooleanField()),
                ('auto_accept_unranked', models.BooleanField()),
                ('eligible_for', models.ManyToManyField(related_name='teams', to='teams.eligibilitycriterion')),
                ('rating', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='teams.rating')),
            ],
        ),
        migrations.AddConstraint(
            model_name='team',
            constraint=models.UniqueConstraint(fields=('episode', 'name'), name='team-unique-episode-name'),
        ),
    ]
