TABLE_WIDTH = 108
TABLE_HEIGTH = 54

MAX_PADDLE_Y = 27
MIN_PADDLE_Y = -27
PADDLE_X = 54

SCREEN_CENTER = 10
ACCELERATION = 1.1
BUTTON_COLOR = (0, 0, 0)

PADDLE_WIDTH = 10
PADDLE_HEIGHT = 50

REFRESH_RATE = 0.02
MOVSPEED = 1.3
BALL_WIDTH = 10
BALL_HEIGHT = 10

MAX_WIDTH = TABLE_WIDTH / 2
MIN_WIDTH = - (TABLE_WIDTH / 2)
INITIAL_STATE = {
    "player_one": {"x": -PADDLE_X, "y": 0, "score": 0,},
    "player_two": {"x": PADDLE_X, "y": 0, "score": 0,},
    "ball": {"x": 0, "y": 0,"dirX": 1, "dirY": 0, "speed": 2.1,},
}