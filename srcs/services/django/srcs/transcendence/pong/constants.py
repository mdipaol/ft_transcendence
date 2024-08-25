from dataclasses import dataclass

@dataclass(frozen=True)
class Costants:

    TABLE_WIDTH = 108
    TABLE_HEIGTH = 54

    MAX_PADDLE_Y = TABLE_HEIGTH / 2
    MIN_PADDLE_Y = - TABLE_HEIGTH / 2

    PADDLE_SIZE = 17
    PADDLE_HALF = PADDLE_SIZE / 2

    SCREEN_CENTER = 10
    ACCELERATION = 1.1
    BUTTON_COLOR = (0, 0, 0)

    PADDLE_WIDTH = 10
    PADDLE_HEIGHT = 50

    REFRESH_RATE = 0.01
    MOVSPEED = 85

    BALL_WIDTH = 10
    BALL_HEIGHT = 10

    BALL_SPEED = 100

    BALL_AWAIT = 3

    MAX_WIDTH = (TABLE_WIDTH / 2)
    MIN_WIDTH = -(TABLE_WIDTH / 2)

    MAX_SCORE = 7

    POWERUP_DURATION = 2
    WAIT_POWERUP = 2

    INITIAL_STATE = {
        "player_one": {"x": MIN_WIDTH, "y": 0, "score": 0,},
        "player_two": {"x": MAX_WIDTH, "y": 0, "score": 0,},
        "ball": {"x": 0, "y": 0,"dirX": 1, "dirY": 0, "speed": 1,},
    }
