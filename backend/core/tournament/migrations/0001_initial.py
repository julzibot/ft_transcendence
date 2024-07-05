# Generated by Django 5.0.6 on 2024-07-05 14:13

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TournamentData',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=60)),
                ('numberOfPlayers', models.PositiveIntegerField(blank=True, default=0, null=True)),
                ('isPrivate', models.BooleanField(blank=True, default=False, null=True)),
                ('difficultyLevel', models.PositiveIntegerField(blank=True, default=0, null=True)),
                ('isActiveTournament', models.BooleanField(blank=True, default=False, null=True)),
                ('pointsPerGame', models.PositiveIntegerField(blank=True, default=0, null=True)),
                ('timer', models.PositiveIntegerField(blank=True, default=0, null=True)),
                ('powerUps', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, default='SOME', max_length=60, null=True), blank=True, default=list, null=True, size=None)),
                ('round', models.PositiveIntegerField(blank=True, default=0, null=True)),
                ('gameName', models.CharField(blank=True, default='', null=True)),
            ],
        ),
    ]
