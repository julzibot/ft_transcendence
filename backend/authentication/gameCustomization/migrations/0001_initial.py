# Generated by Django 5.0.6 on 2024-07-02 11:36

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
                ('opacity', models.SmallIntegerField(default=0)),
                ('sparks', models.BooleanField(default=True)),
            ],
        ),
    ]
