#sssoooooioioioiossscsass
import time, asyncio, uuid, re, copy, random
from . import constants
from .models import Match
from channels.layers import get_channel_layer

class Match:
    def __init__(self):
        self.channel_layer = get_channel_layer()
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

        self.exchanges : int = 0

        # PowerUpas
        self.activePowerUp = False
        self.waitPowerUp : int = 0
        self.powerUp : int = 0
        self.powerUpId : int = 0

        self.arrayPowerUp = {
            0 : "triple",
            1 : "slowness",
            2 : "scale",
            3 : "triple",
            4 : "slowness",
            5 : "scale",
            6 : "triple",
            7 : "slowness",
        }

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

    async def send_message(self, type, event, obj):
        await self.channel_layer.group_send(
            self.id, {
                "type": type,
                "event" : event,
                "message": obj,
            }
        )

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

    async def addPowerUp(self):
        self.waitPowerUp += 1
        if (self.waitPowerUp >= 5 and self.exchanges % 5 == 0 and self.powerUp == 0):
            if (self.activePowerUp == False):
                self.activePowerUp = True
                x = 0
                y = random.randint(constants.MIN_PADDLE_Y, constants.MAX_PADDLE_Y)
                self.waitPowerUp = 0
                self.powerUpId = random.randint(0, 7)
                await self.send_message("game_message", "powerUpSpawn", {
                    "powerUp" : self.powerUpId,
                    "x" : x,
                    "y" : y
                })

    # async def powerUpTaken(self):
    #     if (self.activePowerUp == True):
    #         self.activePowerUp = False

    #         self.powerUp = 2
    #         if self.state["ball"]["dirX"] > 0:
    #             self.powerUp = 1

    #         match self.powerUpId:
    #             case 0:
    #                 this.player1.powerUp = {
    #                     name : "triple",
    #                     type : this.powerUp
    #                 }
    #             case 1:
    #                 this.player1.powerUp = {
    #                     name : "slowness",
    #                     type : this.powerUp
    #                 }
    #             case 2:
    #                 this.player1.powerUp = {
    #                     name : "scale",
    #                     type : this.powerUp
    #                 }
    #             # if (this.player1.powerUp && this.player1.powerUp.name == "slowness"):
    #             #     this.player2.speed = 0.3
    #             # if (this.player2.powerUp && this.player2.powerUp.name == "slowness"):
    #             #     this.player1.speed = 0.3

    #             # if (this.player1.powerUp && this.player1.powerUp.name ==  "scale"):
    #             #     this.player2.mesh.position.z = -6
    #             #     this.player2.mesh.scale.multiplyScalar(0.7)

    #             # if (this.player2.powerUp && this.player2.powerUp.name ==  "scale"):
    #             #     this.player1.mesh.position.z = -6
    #             #     this.player1.mesh.scale.multiplyScalar(0.7)

    #             # if (player.powerUp.name == "triple"):
    #             #     this.add_triple()

    #         await self.send_message("game_message", "powerUpTaken", {})

    def check_collision(self):
        if self.collision:
            return None
        if self.state["ball"]["x"] <= constants.MIN_WIDTH:
            if  self.state["ball"]["y"] >= self.state["player_one"]["y"] - constants.PADDLE_HALF and self.state["ball"]["y"] <= self.state["player_one"]["y"] + constants.PADDLE_HALF:
                self.exchanges += 1
                return "player_one"
        elif self.state["ball"]["x"] >= constants.MAX_WIDTH:
            if  self.state["ball"]["y"] >= self.state["player_two"]["y"] - constants.PADDLE_HALF and self.state["ball"]["y"] <= self.state["player_two"]["y"] + constants.PADDLE_HALF:
                self.exchanges += 1
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
            self.exchanges = 0
            # print(self.state)
            await self.send_message("game_message", "score", {
                "player_one" : self.state["player_one"]["score"],
                "player_two" : self.state["player_two"]["score"],
            })
            if self.state["player_one"]["score"] == constants.MAX_SCORE or self.state["player_two"]["score"] == constants.MAX_SCORE:
                self.match_end()
            else:
                await asyncio.sleep(1)

    async def ball_move(self):

        now = time.time()
        # print(time.time() - self.update_time)
        if now - self.update_time < constants.REFRESH_RATE:
            await asyncio.sleep(constants.REFRESH_RATE - ( now - self.update_time))

        # Update game state
        self.state["ball"]["x"] += self.state["ball"]["speed"] * self.state["ball"]["dirX"]
        self.state["ball"]["y"] += self.state["ball"]["speed"] * self.state["ball"]["dirY"]

        # Bot logic
        ...

        # Powerup collision
        ...

        # Player - ball collision
        bam = self.check_collision()
        if bam:
            await self.send_message("game_message", "exchanges", {
                    "exchanges" : self.exchanges,
            })
            await self.addPowerUp()
            self.state["ball"]["dirX"] *= -1
            self.state["ball"]["dirY"] = (self.state["ball"]["y"] - self.state[bam]["y"]) / 10
            self.collision = True
        # Ball - wall collision
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

async def game_loop(match : Match):

    channel_layer = get_channel_layer()

    while not match.get_end():

        # Logica gioco
        await match.ball_move()

        # Send game state
        await channel_layer.group_send(
            match.id, {
                "type": "game_message",
                "event" : "state",
                "match_id": match.id,
                "message": match.get_state(),
                }
        )
    # Send game end
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
