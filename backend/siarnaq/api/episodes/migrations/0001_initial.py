# Generated by Django 4.0.6 on 2022-07-30 19:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Episode',
            fields=[
                ('name_short', models.SlugField(max_length=16, primary_key=True, serialize=False)),
                ('name_long', models.CharField(max_length=128)),
                ('blurb', models.TextField(blank=True)),
                ('registration', models.DateTimeField()),
                ('game_release', models.DateTimeField()),
                ('game_archive', models.DateTimeField()),
                ('submission_frozen', models.BooleanField(default=True)),
                ('autoscrim_schedule', models.CharField(blank=True, max_length=64)),
                ('language', models.CharField(choices=[('java8', 'Java 8'), ('py3', 'Python 3')], max_length=8)),
                ('release_version', models.SlugField(blank=True, max_length=32)),
                ('pass_requirement_win', models.PositiveSmallIntegerField(blank=True)),
                ('pass_requirement_out_of', models.PositiveSmallIntegerField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Map',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.SlugField(max_length=24)),
                ('is_public', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('name_short', models.SlugField(max_length=32, primary_key=True, serialize=False)),
                ('name_long', models.CharField(max_length=128)),
                ('blurb', models.TextField(blank=True)),
                ('style', models.CharField(choices=[('SE', 'Single Elimination'), ('DE', 'Double Elimination')], max_length=2)),
                ('require_resume', models.BooleanField()),
                ('is_public', models.BooleanField()),
                ('submission_freeze', models.DateTimeField()),
                ('submission_unfreeze', models.DateTimeField()),
                ('in_progress', models.BooleanField(default=False)),
                ('challonge_private', models.URLField()),
                ('challonge_public', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='TournamentRound',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('challonge_id', models.SmallIntegerField()),
                ('name', models.CharField(max_length=64)),
                ('is_released', models.BooleanField(default=False)),
                ('maps', models.ManyToManyField(related_name='tournament_rounds', to='episodes.map')),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='rounds', to='episodes.tournament')),
            ],
        ),
    ]
