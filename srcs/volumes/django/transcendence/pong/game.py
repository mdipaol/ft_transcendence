
import time, asyncio, uuid, re, copy
from . import constants
from .models import Match
from channels.layers import get_channel_layer

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
    def __init__(self):
        self.state = copy.deepcopy(constants.INITIAL_STATE)
        self.id = str(uuid.uuid4())
        self.lock = asyncio.Lock()
        self.task = None
        self.player_one = None
        self.player_two = None
        self.collision = False
        self.start_time = time.time()
        self.update_time = time.time()
        self.end = False
        self.winner = None

    def __str__(self):
        return self.id + ' ' + str(id(self.state))

    def get_lock(self):
        return self.lock

    def get_task(self):
        return self.task

    def set_task(self, task):
        self.task = task

    def get_players(self):
        return [self.player_one, self.player_two]

    def full(self):
        return self.player_one and self.player_two

    def empty(self):
        return not self.player_one and not self.player_two

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

    def delete_player(self, player):
        if self.player_one == player:
            self.player_one = None
        elif self.player_two == player:
            self.player_two = None

        if self.task:
            self.task.cancel()
            self.taks = None

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

    async def check_point(self):
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
            self.state["player_one"]["y"] = 0
            self.state["player_two"]["y"] = 0
            print(self.state)
            if self.state["player_one"]["score"] == constants.MAX_SCORE or self.state["player_two"]["score"] == constants.MAX_SCORE:
                self.match_end()
            else:
                await asyncio.sleep(1)

    async def ball_move(self):

        now = time.time()
        # print(time.time() - self.update_time)
        if now - self.update_time < constants.REFRESH_RATE:
            await asyncio.sleep(constants.REFRESH_RATE - ( now - self.update_time))

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
        await self.check_point()

        self.update_time = time.time()

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

    def get_state(self):
        return self.state

async def game_loop(match):

    channel_layer = get_channel_layer()

    while not match.get_end():

        # Logica gioco
        await match.ball_move()
        await channel_layer.group_send(
            match.id, {
                "type": "game_message",
                "match_id": match.id,
                "message": match.get_state()
                }
        )
    await channel_layer.group_send(
            match.id, {
                "type": "game_end",
                "message": match.get_state()
            }
    )

class MatchManager:

    matches = []

    active_monitoring = None

    @classmethod
    def get_avaiable_match(cls):
        for item in cls.matches:
            if not item.full():
                return item
        match = Match()
        cls.matches.append(match)
        return match

    @classmethod
    def get_consumer_match(cls, consumer):
        for item in cls.matches:
            if consumer.player_id in item.get_players():
                return item
        return None

    @classmethod
    async def add_player(cls, consumer):

        if not cls.active_monitoring:
            cls.active_monitoring = asyncio.create_task(monitoring())

        # check if player is already on match...
        if consumer.match:
            await consumer.close()

        # get avaiable match
        consumer.match = cls.get_avaiable_match()

        # add player to match
        consumer.match.add_player(consumer.player_id)

        # Django Channels messages
        await consumer.channel_layer.group_add(consumer.match.id, consumer.channel_name)

        # Create task if two players are added in the same match
        if consumer.match.full():
            print("Player List")
            print(consumer.match.get_players())
            print(id(consumer.match))
            await consumer.channel_layer.group_send(consumer.match.id, {"type" : "game_start"})
            consumer.match.set_task(asyncio.create_task(game_loop(consumer.match)))
            print("Task created: ", consumer.match.get_task())
            print("Match_id: ", consumer.match.id)
            print("Match addr: ", consumer.match)
            print("Match state: ", consumer.match.state)

    @classmethod
    async def delete_player(cls, consumer):
        match = cls.get_consumer_match(consumer)

        # Remove consumer from match
        if match:
            match.delete_player(consumer.player_id)
            # Django channels group delete
            await consumer.channel_layer.group_send(match.id, {"type": "game_end"})
            await consumer.channel_layer.group_discard(match.id, consumer.channel_name)
            if match.empty():
                cls.matches.remove(match)
                del match

async def monitoring():
    while True:
        print("monitoring")
        print ("matches")
        print(*MatchManager.matches, sep=', ')
        print("end monitoring")
        # print(asyncio.all_tasks())
        await asyncio.sleep(5)
