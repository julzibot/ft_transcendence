# Generated by Django 5.0.6 on 2024-06-25 11:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0006_tournamentdata_round'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentdata',
            name='gameName',
            field=models.CharField(blank=True, default='', null=True),
        ),
    ]
