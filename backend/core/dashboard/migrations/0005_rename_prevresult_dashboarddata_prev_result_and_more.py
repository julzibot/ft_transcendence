# Generated by Django 5.0.6 on 2024-07-17 11:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0004_dashboarddata_prevresult'),
    ]

    operations = [
        migrations.RenameField(
            model_name='dashboarddata',
            old_name='prevResult',
            new_name='prev_result',
        ),
        migrations.RemoveField(
            model_name='dashboarddata',
            name='losses',
        ),
    ]
