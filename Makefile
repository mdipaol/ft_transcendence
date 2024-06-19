NAME := ft_transcendence

SRC = srcs

all: $(NAME)

$(NAME): $(SRC)
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

re: fclean all

.PHONY: all clean fclean re start stop
