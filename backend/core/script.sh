#!/bin/sh

sleep 2

DJANGO_SECRET=$(python3 -c 'from django.core.management.utils import get_random_secret_key; import re; print(re.escape(get_random_secret_key()))')
TOKEN_SIGNING_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; import re; print(re.escape(get_random_secret_key()))')

python manage.py makemigrations
python manage.py migrate

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python manage.py createsuperuser \
        --noinput \
        --email $DJANGO_SUPERUSER_EMAIL \
        --username $DJANGO_SUPERUSER_USERNAME
fi

python manage.py runserver_plus 0.0.0.0:8000 --cert-file cert.cert --key-file key.key
