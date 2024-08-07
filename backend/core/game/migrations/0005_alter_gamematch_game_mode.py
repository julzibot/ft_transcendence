# Generated by Django 5.0.7 on 2024-07-17 11:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_alter_gamematch_player1_alter_gamematch_player2'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamematch',
            name='game_mode',
            field=models.PositiveSmallIntegerField(choices=[(0, 'Local'), (1, 'AI'), (2, 'Online'), (3, 'Tournament')], default=0),
        ),
    ]
