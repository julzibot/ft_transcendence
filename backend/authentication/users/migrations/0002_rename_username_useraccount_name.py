# Generated by Django 5.0.2 on 2024-02-19 14:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='useraccount',
            old_name='username',
            new_name='name',
        ),
    ]
