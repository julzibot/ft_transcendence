#!/bin/sh

sleep 1

export DJANGO_SECRET=$(python3 -c 'from django.core.management.utils import get_random_secret_key; import re; print(re.escape(get_random_secret_key()))')
export TOKEN_SIGNING_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; import re; print(re.escape(get_random_secret_key()))')

python manage.py makemigrations
python manage.py migrate

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python manage.py createsuperuser \
        --noinput \
        --login $DJANGO_SUPERUSER_USERNAME \
        --email $DJANGO_SUPERUSER_EMAIL
fi

python manage.py runserver 0.0.0.0:8000

