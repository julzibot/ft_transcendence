# Generated by Django 5.0.7 on 2024-07-26 14:22

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0005_rename_prevresult_dashboarddata_prev_result_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameField(
            model_name='dashboarddata',
            old_name='streak',
            new_name='current_streak',
        ),
        migrations.RemoveField(
            model_name='dashboarddata',
            name='prev_result',
        ),
        migrations.RemoveField(
            model_name='dashboarddata',
            name='user_id',
        ),
        migrations.AddField(
            model_name='dashboarddata',
            name='record_streak',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='dashboarddata',
            name='user',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, related_name='user_dashboard', to=settings.AUTH_USER_MODEL),
        ),
    ]
