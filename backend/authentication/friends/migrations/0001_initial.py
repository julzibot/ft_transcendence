# Generated by Django 5.0.4 on 2024-04-12 09:39

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('requestor', models.CharField(choices=[('UID1', 'Uid1'), ('UID2', 'Uid2')], max_length=4)),
                ('status', models.CharField(choices=[('FRIENDS', 'Friends'), ('REQUEST', 'Request')], max_length=7)),
                ('request_date', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateField(auto_now=True)),
            ],
        ),
    ]
