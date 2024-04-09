
import time
from . import constants

class Game:
    state = constants.INITIAL_STATE

class PaddleController:
    def __init__(self, paddle):
        """
        paddle: 'player_one' | 'player_two'
        """

        self.state = Game.state
        self.paddle = paddle
        self.item = self.state[paddle]

    def move(self, direction):
        if direction == "down" and self.item["y"] < constants.MIN_PADDLE_Y:
            self.item["y"] += 0.7

        elif direction == "up" and self.item["y"] > constants.MAX_PADDLE_Y:
            self.item["y"] -= 0.7

    def __str__(self):
        return self.paddle

class BallController:
    def __init__(self):
        self.state = Game.state
        self.item = self.state["ball"]
        self.paddle_one = self.state["player_one"]
        self.paddle_two = self.state["player_two"]

        self.reset_ball()

        self.time = time.time()

    def reset_ball(self):
        self.vel_x = -5
        self.vel_y = 5
        self.item["x"] = constants.SCREEN_CENTER[0]
        self.item["y"] = 10

    def move(self):
        if time.time() - self.time > 0.01:
            if (
                self.item["y"] > constants.MAX_BALL_Y
                or self.item["y"] < constants.BALL_HEIGHT
            ):
                self.vel_y = -self.vel_y

            if 0 < self.item["x"] <= constants.PADDLE_WIDTH:
                if (
                    self.paddle_one["y"]
                    < self.item["y"]
                    < (self.paddle_one["y"] + constants.PADDLE_HEIGHT)
                ):
                    self.vel_x = -self.vel_x
                    self.item["x"] += 7

            elif self.item["x"] < 0:
                self.paddle_two["score"] += 1
                self.reset_ball()

            elif constants.SCREEN_WIDTH > self.item["x"] >= constants.MAX_BALL_X:
                if (
                    self.paddle_two["y"]
                    < self.item["y"]
                    < (self.paddle_two["y"] + constants.PADDLE_HEIGHT)
                ):
                    self.vel_x = -self.vel_x
                    self.item["x"] -= 7

            elif self.item["x"] >= constants.SCREEN_WIDTH:
                self.paddle_one["score"] += 1
                self.reset_ball()

            self.item["x"] += self.vel_x
            self.item["y"] += self.vel_y

            self.time = time.time()

class Match:
    def __init__(self, name) -> None:
        self.name = name

    task = None
    state = constants.INITIAL_STATE
    full = False
    player_one = None
    player_two = None

    def add_player(self, player):
        if self.player_one is None:
            self.player_one = player
        elif self.player_two is None:
            self.player_two = player
            self.full = True

    def move(self, player_id, direction):
        paddle = "player_one"
        if not player_id == self.player_one:
            paddle = "player_two"
        if direction == "up" :
            self.state[paddle]["y"] += constants.MOVSPEED
        else:
            self.state[paddle]["y"] -= constants.MOVSPEED

    def get_full(self):
        return self.full
    
    def get_state(self):
        return self.state

class MatchManager:
    matches = {}

    def get_matches(self):
        return self.matches