COMPOSE = docker-compose.yml

all:
	docker compose -f $(COMPOSE) up

re: fclean all

down:
	docker compose -f $(COMPOSE) down

prune:
	docker system prune --force

fclean: stop down
	-docker rm -f $$(docker ps -a -q)
	-docker image rm $$(docker images -aq)

stop:
	-docker stop $$(docker ps -qa)

.PHONY: all re prune down fclean stop