# Generated by Django 5.0.6 on 2024-06-24 11:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0005_alter_tournamentdata_tournamentwinner'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentdata',
            name='round',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
    ]
