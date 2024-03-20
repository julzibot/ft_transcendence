cd authentication
docker compose up -d
docker exec -it authentication-auth-1 sh
python manage.py makemigrations
python manage.py migrate