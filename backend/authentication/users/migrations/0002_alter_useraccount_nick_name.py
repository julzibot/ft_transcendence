# Generated by Django 5.0.4 on 2024-04-12 16:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useraccount',
            name='nick_name',
            field=models.CharField(default='John Davenport', max_length=60),
        ),
    ]
