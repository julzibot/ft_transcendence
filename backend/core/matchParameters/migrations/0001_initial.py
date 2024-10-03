# Generated by Django 5.1.1 on 2024-10-03 09:05

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MatchParametersData',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('points_to_win', models.SmallIntegerField(default=1)),
                ('game_difficulty', models.SmallIntegerField(default=3)),
                ('power_ups', models.BooleanField(default=True)),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='match_parameters', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
