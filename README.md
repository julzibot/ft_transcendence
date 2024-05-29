1. make sure to change your 42 login in the docker-compose.yml for database volume (line 28)
2. on the root of the project, enter docker compose up
3. create the .env files by following the guides on the .env.example files in back and frontend
4. ONLY AT DATABASE FIRST CREATION: $ docker exec -it backend sh
    -> python manage.py makemigrations
    -> python manage.py migrate
    -> python manage.py createsuperuser

5. you might have to restart container after step 4
6. Enjoy

