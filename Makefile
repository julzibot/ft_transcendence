COMPOSE = docker-compose.yml

all:
	docker-compose -f $(COMPOSE) up --build

re: fclean all

down:
	docker compose -f $(COMPOSE) down

prune:
	docker system prune --force

fclean: down
	-docker image rm $$(docker images -aq)
	-docker volume rm $$(docker volume ls -q)


.PHONY: all re prune down fclean