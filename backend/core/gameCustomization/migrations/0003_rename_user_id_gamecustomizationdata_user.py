# Generated by Django 5.1.1 on 2024-10-03 08:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gameCustomization', '0002_alter_gamecustomizationdata_opacity'),
    ]

    operations = [
        migrations.RenameField(
            model_name='gamecustomizationdata',
            old_name='user_id',
            new_name='user',
        ),
    ]
