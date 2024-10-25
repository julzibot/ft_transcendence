# Generated by Django 5.1.1 on 2024-10-24 13:28

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GameCustomizationData',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('background', models.SmallIntegerField(default=0)),
                ('palette', models.SmallIntegerField(default=0)),
                ('bgColor', models.CharField(default='#ff0000')),
                ('opacity', models.SmallIntegerField(default=80)),
                ('sparks', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Game Customization Data',
                'verbose_name_plural': 'Game Customizations',
            },
        ),
    ]
