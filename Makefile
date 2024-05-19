NAME := ft_transcendence

SRC = srcs

all: $(NAME)

$(NAME): $(SRC)
	@ bash $(SRC)/utils/volumes_check.sh
	@ docker compose --project-directory $(SRC) up -d --build

nodetatch:
	@ docker compose --project-directory $(SRC) up --build

start:
	@ docker compose --project-directory $(SRC) start

stop:
	@ docker compose --project-directory $(SRC) stop

clean:
	@ docker compose --project-directory $(SRC) down

fclean: clean
	@ docker compose --project-directory $(SRC) down -v --rmi all

purge: fclean
	@ sudo rm -rf $(SRC)/volumes/postgres/
	@ sudo rm -rf $(SRC)/volumes/django/transcendence/pong/__pycache__/*
	@ sudo rm -rf $(SRC)/volumes/django/transcendence/pong/migrations/*

re: fclean all

.PHONY: all clean fclean re start stop
