# Generated by Django 5.0.4 on 2024-04-16 12:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_useraccount_nick_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useraccount',
            name='nick_name',
            field=models.CharField(default='Christina Anderson', max_length=60),
        ),
    ]
