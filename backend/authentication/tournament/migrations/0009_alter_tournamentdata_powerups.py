# Generated by Django 5.0.6 on 2024-07-04 11:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0008_alter_tournamentdata_powerups'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournamentdata',
            name='powerUps',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]