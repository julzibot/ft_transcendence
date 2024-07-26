# Generated by Django 5.0.6 on 2024-07-17 11:05

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_gamematch_delete_game'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamematch',
            name='player1',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player1_gamehistory', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='gamematch',
            name='player2',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player2_gamehistory', to=settings.AUTH_USER_MODEL),
        ),
    ]