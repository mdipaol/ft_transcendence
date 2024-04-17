
import time, asyncio
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
        self.state = constants.INITIAL_STATE
        self.name = name
        self.lock = asyncio.Lock()
        self.task = None
        self.ball_direction = []
        self.full = False
        self.player_one = None
        self.player_two = None
        self.collision = False
        self.start_time = time.time()
        self.end = False
        self.winner = None

    def get_lock(self):
        return self.lock

    def get_task(self):
        return self.task
    
    def set_task(self, task):
        self.task = task

    def get_players(self):
        return [self.player_one, self.player_two]

    def who_player(self, name):
        player = "error"
        if name == self.player_one:
            player = "player_one"
        elif name == self.player_two:
            player = "player_two"
        return player

    def add_player(self, player):
        if self.player_one is None:
            self.player_one = player
        elif self.player_two is None:
            self.player_two = player
        if self.player_one and self.player_two:
            self.full = True

    def delete_player(self, player):
        self.full = False
        if self.player_one == player:
            self.player_one = None
        elif self.player_two == player:
            self.player_two = None
        else:
            self.full = True

    def get_winner(self):
        return self.winner

    def get_end(self):
        return self.end

    def match_end(self):
        self.end = True
        if self.state["player_one"]["score"] == constants.MAX_SCORE:
            self.winner = self.player_one
        elif self.state["player_two"]["score"] == constants.MAX_SCORE:
            self.winner = self.player_two

    def check_collision(self):
        if self.collision:
            return None
        if self.state["ball"]["x"] <= constants.MIN_WIDTH:
            if  self.state["ball"]["y"] >= self.state["player_one"]["y"] - constants.PADDLE_HALF and self.state["ball"]["y"] <= self.state["player_one"]["y"] + constants.PADDLE_HALF:
                return "player_one"
        elif self.state["ball"]["x"] >= constants.MAX_WIDTH:
            if  self.state["ball"]["y"] >= self.state["player_two"]["y"] - constants.PADDLE_HALF and self.state["ball"]["y"] <= self.state["player_two"]["y"] + constants.PADDLE_HALF:
                return "player_two"
        return None

    def wall_collision(self):
        if self.state["ball"]["y"] >= constants.MAX_PADDLE_Y:
            self.state["ball"]["y"] = constants.MAX_PADDLE_Y - 0.1
            self.state["ball"]["dirY"] *= -1
        elif self.state["ball"]["y"] <= constants.MIN_PADDLE_Y:
            self.state["ball"]["y"] = constants.MIN_PADDLE_Y + 0.1
            self.state["ball"]["dirY"] *= -1

    def check_point(self):
        if self.state["ball"]["x"] <= constants.MIN_WIDTH -5 or self.state["ball"]["x"] >= constants.MAX_WIDTH + 5:
            if self.state["ball"]["x"] < 0:
                self.state["player_two"]["score"] += 1
                self.state["ball"]["dirX"] = -1
            else:
                self.state["player_one"]["score"] += 1
                self.state["ball"]["dirX"] = 1
            self.state["ball"]["dirY"] = 0
            self.state["ball"]["y"] = 0
            self.state["ball"]["x"] = 0
            if self.state["player_one"]["score"] == constants.MAX_SCORE or self.state["player_two"]["score"] == constants.MAX_SCORE:
                self.match_end()

    async def ball_move(self):
        self.state["ball"]["x"] += self.state["ball"]["speed"] * self.state["ball"]["dirX"]
        self.state["ball"]["y"] += self.state["ball"]["speed"] * self.state["ball"]["dirY"]
        bam = self.check_collision()
        if bam:
            self.state["ball"]["dirX"] *= -1
            self.state["ball"]["dirY"] = (self.state["ball"]["y"] - self.state[bam]["y"]) / 10
            self.collision = True
        self.wall_collision()
        if self.collision and self.state["ball"]["x"] > -constants.SCREEN_CENTER and self.state["ball"]["x"] < constants.SCREEN_CENTER:
            self.collision = False
        self.check_point()

    def paddle_move(self, player_id, direction):
        if player_id not in [self.player_one, self.player_two]:
            return
        paddle = "player_one"
        if not player_id == self.player_one:
            paddle = "player_two"
        if direction == "up" and self.state[paddle]["y"] + constants.MOVSPEED < constants.MAX_PADDLE_Y:
            self.state[paddle]["y"] += constants.MOVSPEED
        elif direction == "down" and self.state[paddle]["y"] - constants.MOVSPEED > constants.MIN_PADDLE_Y:
            self.state[paddle]["y"] -= constants.MOVSPEED

    def get_full(self):
        return self.full

    def get_state(self):
        return self.state

class MatchManager:
    def __init__(self):
        self.matches = {}

    def get_matches(self):
        return self.matches