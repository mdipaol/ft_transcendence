NAME := ft_transcendence

SRC = srcs/

all: $(NAME)

$(NAME): $(SRC)
	@ docker compose --project-directory $(SRC) up -d --build

stop:
	@ docker compose --project-directory $(SRC) stop

clean:
	@ docker compose --project-directory $(SRC) down

fclean: clean
	@ docker compose --project-directory $(SRC) down -v --rmi all

re: fclean all

.PHONY: all clean fclean re