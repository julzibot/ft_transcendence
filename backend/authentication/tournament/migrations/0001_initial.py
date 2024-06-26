# Generated by Django 5.0.6 on 2024-06-08 12:49

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
                ('numberOfPlayers', models.PositiveIntegerField(default=120)),
                ('tournamentWinner', models.CharField(max_length=60, unique=True)),
            ],
        ),
    ]
