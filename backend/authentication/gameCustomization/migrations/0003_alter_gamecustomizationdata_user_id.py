# Generated by Django 5.0.6 on 2024-07-02 18:45

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gameCustomization', '0002_gamecustomizationdata_user_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamecustomizationdata',
            name='user_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player_settings', to=settings.AUTH_USER_MODEL),
        ),
    ]
