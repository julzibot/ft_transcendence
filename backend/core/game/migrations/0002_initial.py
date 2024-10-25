# Generated by Django 5.1.1 on 2024-10-24 13:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('game', '0001_initial'),
        ('tournament', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='gamematch',
            name='player1',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player1_gamehistory', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='gamematch',
            name='player2',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player2_gamehistory', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='gamematch',
            name='tournament',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tournament_gamehistory', to='tournament.tournamentmodel'),
        ),
    ]
