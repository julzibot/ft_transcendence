# Generated by Django 5.0.6 on 2024-07-04 12:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lobby', '0002_alter_lobbydata_powerups'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lobbydata',
            name='powerUps',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]