# Generated by Django 5.1.1 on 2024-11-03 18:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dashboarddata',
            name='current_streak',
        ),
        migrations.RemoveField(
            model_name='dashboarddata',
            name='prev_result',
        ),
        migrations.RemoveField(
            model_name='dashboarddata',
            name='record_streak',
        ),
    ]
