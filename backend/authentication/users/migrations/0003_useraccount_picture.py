# Generated by Django 5.0.2 on 2024-02-23 12:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_rename_username_useraccount_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='useraccount',
            name='picture',
            field=models.CharField(default='picture.url', max_length=512),
        ),
    ]
