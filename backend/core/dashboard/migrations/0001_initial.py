# Generated by Django 5.1.1 on 2024-10-29 11:24

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
            name='DashboardData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('record_streak', models.IntegerField(default=0)),
                ('current_streak', models.IntegerField(default=0)),
                ('prev_result', models.BooleanField(default=False)),
                ('tournaments_won', models.IntegerField(default=0)),
                ('tournaments_played', models.IntegerField(default=0)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user_dashboard', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Dashboard Data',
                'verbose_name_plural': 'Dashboards',
            },
        ),
    ]
