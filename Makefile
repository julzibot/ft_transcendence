COMPOSE = docker-compose.yml

all:
	docker compose -f $(COMPOSE) up -d

re: fclean all

down:
	docker compose -f $(COMPOSE) down

prune:
	docker system prune --force

fclean: stop down
	-docker rm -f $$(docker ps -a -q)
	-docker image rm $$(docker images -aq)
	-docker volume rm $$(docker volume ls -q)
	-rm -rf pgadmin_data/*

stop:
	-docker stop $$(docker ps -qa)

.PHONY: all re prune down fclean stop