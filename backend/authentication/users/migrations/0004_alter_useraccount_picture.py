# Generated by Django 5.0.2 on 2024-02-26 10:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_useraccount_picture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useraccount',
            name='picture',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
