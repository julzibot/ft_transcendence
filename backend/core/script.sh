#!/bin/sh

if [ "$DB_NAME" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi


export DJANGO_SECRET=$(python3 -c 'from django.core.management.utils import get_random_secret_key; import re; print(re.escape(get_random_secret_key()))')

export TOKEN_SIGNING_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; import re; print(re.escape(get_random_secret_key()))')

# python manage.py flush --no-input
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --no-input

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python manage.py createsuperuser \
        --noinput \
        --email $DJANGO_SUPERUSER_EMAIL \
        --username $DJANGO_SUPERUSER_USERNAME
fi


exec "$@"
