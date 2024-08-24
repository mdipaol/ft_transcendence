import time, asyncio, uuid, random, pprint, traceback
from .constants import Costants
from channels.layers import get_channel_layer

class State:
    def __init__(self):
        self.players = {"player_one": None, "player_two": None}
        self.ball = None
        self.scores = {"player_one": 0, "player_two": 0}
        self.exchanges = 0
        self.started = False
        self.ended = False
        self.full = False

    def reset(self):
        self.players = {"player_one": None, "player_two": None}
        self.ball = None
        self.scores = {"player_one": 0, "player_two": 0}
        self.exchanges = 0
        self.started = False
        self.ended = False
        self.full = False

    def update(self, player1, player2, ball, score1, score2):
        self.players["player_one"] = {"x": player1.position.x, "y": player1.position.y, "score": score1}
        self.players["player_two"] = {"x": player2.position.x, "y": player2.position.y, "score": score2}
        self.ball = {"x": ball.position.x, "y": ball.position.y, "dirX": ball.direction.x, "dirY": ball.direction.y, "speed": ball.speed}

class Vector2D:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def normalizeVector(self):
        magnitude = (self.x**2 + self.y**2)**0.5
        if magnitude > 0:
            self.x /= magnitude
            self.y /= magnitude

class Ball:
    def __init__(self) -> None:
        self.position = Vector2D(0, 0)
        self.direction = Vector2D(1, 0)
        self.speed = Costants.BALL_SPEED

    def reset(self):
        self.position = Vector2D(0, 0)
        self.direction.y = 0
        self.speed = Costants.BALL_SPEED

    def check_limit_y(self):
        if self.position.y > Costants.MAX_PADDLE_Y \
            or self.position.y < Costants.MIN_PADDLE_Y :
            return True
        return False

    def check_limit_x(self):
        if self.position.x > Costants.MAX_WIDTH \
        or self.position.x < Costants.MIN_WIDTH:
            return True
        return False

    def update(self, delta_time):
        self.position.x += self.speed * self.direction.x * delta_time
        self.position.y += self.speed * self.direction.y * delta_time

class PowerUp:
    def __init__(self) -> None:
        self.player : Player = None
        self.position = random.uniform(Costants.MIN_PADDLE_Y, Costants.MAX_PADDLE_Y)
        self.type = random.choice(['scale', 'triple', 'slowness', 'power'])
        self.effect = random.choice(['good', 'bad'])
        self.duration = Costants.POWERUP_DURATION

class Player:
    def __init__(self, name : str, vector : Vector2D) -> None:
        self.name : str = name
        self.position : Vector2D = vector
        self.ready = False
        self.speed = Costants.MOVSPEED
        self.size = Costants.PADDLE_SIZE
        self.half_size = self.size / 2
        self.move = {
            'up' : False,
            'down' : False,
        }
        self.consumer = None

    def __str__(self) -> str:
        return self.name

    def reset(self):
        self.position.y = 0
        self.speed = Costants.MOVSPEED

        # Reset powerups
        ...

    def set_consumer(self, consumer):
        self.consumer = consumer

    def ball_collision(self, ball : Ball):
        if ball.position.y <= self.position.y + self.half_size \
            and ball.position.y >= self.position.y - self.half_size:
            return True
        return False


class Match:

    def __init__(self, powerup_mode: str, id: int = None) -> None:
        self.id = str(uuid.uuid4()) if id is None else id
        self.player1 : Player = Player('player1' ,Vector2D(Costants.MIN_WIDTH, 0))
        self.player2 : Player = Player('player2', Vector2D(Costants.MAX_WIDTH, 0))
        self.ball : Ball = Ball()
        self.ball_await = Costants.BALL_AWAIT
        self.update_ball_await = time.time()
        self.score1 : int = 0
        self.score2 : int = 0
        self.channel_layer = get_channel_layer()
        self.started : bool = False
        self.ended : bool = False
        self.full : bool = False
        self.event_update : bool = False
        self.start_time :float = time.time()
        self.update_time : float = None
        self.exchanges : int = 0

        self.powerup_mode : bool = powerup_mode
        self.active_powerup : PowerUp = None
        self.wait_powerup : int = 0

        self.tournament : bool = False if id is None else True

        self.task = None 
        self.state = {
            "player_one": {"x": self.player1.position.x, "y": self.player1.position.y, "score": self.score1,},
            "player_two": {"x": self.player2.position.x, "y": self.player2.position.y, "score": self.score2,},
            "ball": {"x": self.ball.position.x, "y": self.ball.position.y,"dirX": self.ball.direction.x, "dirY": self.ball.direction.y, "speed": self.ball.speed,},
        }

    def __str__(self) -> str:
        return f'[{self.start_time}]->{self.id}'

    def ready(self, consumer):
        if not consumer:
            return self.player1.ready and self.player2.ready
        if consumer == self.player1.consumer:
            self.player1.ready = True
        elif consumer == self.player2.consumer:
            self.player2.ready = True


    def set_task(self, task):
        self.task = task

    def which_player(self, consumer):
        if consumer == self.player1.consumer:
            return "player_one"
        elif consumer == self.player2.consumer:
            return "player_two"
        else:
            return "consumer_not_found"

    def get_consumer_players(self):
        return [self.player1.consumer, self.player2.consumer]

    async def send_to_channel(self, type: str, message: object):
        await self.channel_layer.group_send(
            self.id, {
                'type' : type,
                'message' : message
            }
        )

    def update_state(self):
        self.state['player_one']['x'] = self.player1.position.x
        self.state['player_one']['y'] = self.player1.position.y
        self.state['player_one']['score'] = self.score1
        self.state['player_two']['x'] = self.player2.position.x
        self.state['player_two']['y'] = self.player2.position.y
        self.state['player_two']['score'] = self.score2
        self.state['ball']['x'] = self.ball.position.x
        self.state['ball']['y'] = self.ball.position.y
        self.state['ball']['dirX'] = self.ball.direction.x
        self.state['ball']['dirY'] = self.ball.direction.y
        self.state['ball']['speed'] = self.ball.speed



    async def send_game_state(self):

        await self.channel_layer.group_send(self.id, {
            "type" : "game_message",
            "event" : "state",
            'message' : {
                "player_one": {"x": self.player1.position.x, "y": self.player1.position.y, "score": self.score1,},
                "player_two": {"x": self.player2.position.x, "y": self.player2.position.y, "score": self.score2,},
                "ball": {"x": self.ball.position.x, "y": self.ball.position.y,"dirX": self.ball.direction.x, "dirY": self.ball.direction.y, "speed": self.ball.speed,},
            }
        })

    def is_empty(self):
        if not self.player1 and not self.player2:
            return True
        return False

    def is_full(self):
        return self.full

    def is_ended(self) -> bool:
        return self.ended

    def is_started(self) -> bool:
        return self.started

    def add_player(self, consumer):
        if self.is_started():
            return
        if not self.player1.consumer:
            self.player1.consumer = consumer
        elif not self.player2.consumer:
            self.player2.consumer = consumer
        if self.player1.consumer and self.player2.consumer:
            self.full = True

    def start_match(self):
        if self.player1.consumer and self.player2.consumer:
            self.started = True

    async def end_match(self):
        if self.task:
            self.task.cancel(self.task)
            try:
                await self.task
            except asyncio.CancelledError:
                print("Task has been cancelled")
        
        self.task = None
        self.ended = True
        self.player1.consumer = None
        self.player2.consumer = None

    def check_players(self):
        if not self.player1.consumer or not self.player2.consumer:
            return False
        return True


    async def reset_powerup_changes(self):
        """
        Reset properties of players and ball, like speed and size
        """

        self.player1.speed = Costants.MOVSPEED
        self.player1.size = Costants.PADDLE_SIZE
        self.player2.speed = Costants.MOVSPEED
        self.player2.speed = Costants.MOVSPEED
        self.ball.speed = Costants.BALL_SPEED

        await self.channel_layer.group_send(self.id, {
            'type' : 'game_message',
            'event' : 'handle_powerup',
            'message' : {
                'type' : 'reset'
            },
        })

    def powerup_power(self):
        self.ball.speed = Costants.BALL_SPEED
        self.ball.speed *= 1.5

    async def powerup_triple(self, add : bool):
        action = 'add' if add else 'remove'
        await self.channel_layer.group_send(self.id,{
                'type' : 'game_message',
                'event' : 'handle_powerup',
                'message' : {
                    'type' : 'triple',
                    'action' : action,
                }
            })

    async def handle_powerup(self, player : Player):
        """
        Handle game modification: power shot and ball speed
        (others powerups are handled when the powerup is taken from the field)
        """
        
        if not self.powerup_mode or not self.active_powerup or not self.active_powerup.player:
            return

        if player == self.active_powerup.player:
            # Player with powerup is the one who just hit the ball  
            if self.active_powerup.type == 'power':
                self.powerup_power()
            elif self.active_powerup.type == 'triple':
                # send triple to player
                await self.powerup_triple(True)
            # Duration decrease when the player with the powerup hits the ball
            self.active_powerup.duration -= 1
            if self.active_powerup.duration == 0:
                self.active_powerup = None
                self.wait_powerup = 0
        else:
            # The other player has the powerup
            self.ball.speed  = Costants.BALL_SPEED
            # send remove triple
            await self.powerup_triple(False)


    async def powerup_taken(self):
        """
        Assigns the powerup to the player
        """
        if not self.active_powerup or not self.powerup_mode:
            return
        
        taker = self.player1 if self.ball.direction.x > 0 else self.player2
        oppenent = self.player2 if taker == self.player1 else self.player1

        good = self.active_powerup.effect == 'good'

        # Assigning powerup to the correct player
        # Enabling slowness, scale or triple ball as soon as the powerup is taken

        if self.active_powerup.type == 'scale':
            self.active_powerup.player = oppenent if good else taker
            self.active_powerup.player.size *= 0.7
            await self.channel_layer.group_send(self.id, {
                'type' : 'game_message',
                'event' : 'handle_powerup',
                'message' : {
                    'type' : 'scale',
                    'player' : 'player_one' if self.active_powerup.player == self.player1 else 'player_two' ,
                }
            })
        elif self.active_powerup.type == 'slowness':
            self.active_powerup.player = oppenent if good else taker
            self.active_powerup.player.speed /= 2
        elif self.active_powerup.type == 'triple':
            self.active_powerup.player = taker if good else oppenent
            if self.active_powerup.player == taker:
                await self.powerup_triple(True)
        elif self.active_powerup.type == 'power':
            self.active_powerup.player = taker if good else oppenent

        await self.channel_layer.group_send(self.id, {
            'type' : 'game_message',
            'event' : 'handle_powerup',
            'message' : {
                'type' : 'powerup_taken',
                'effect' : self.active_powerup.effect,
            }
        })

    async def powerup_collision(self):
        """
        Checks if the ball hits the powerup in the field
        """
        if self.event_update:
            return
        if not self.powerup_mode or not self.active_powerup or self.active_powerup.player:
            return
        if self.ball.position.x > -3 and self.ball.position.x < 3:
            if self.ball.position.y > self.active_powerup.position - 3 and self.ball.position.y < self.active_powerup.position + 3:
                self.event_update = True
                await self.powerup_taken()

    async def handle_player_collision(self, player : Player):

        if player.ball_collision(self.ball):
            self.ball.speed = Costants.BALL_SPEED
            self.event_update = True
            self.ball.direction.y = (self.ball.position.y - player.position.y) / 10
            self.ball.direction.x *= -1
            self.ball.position.x = player.position.x

            self.exchanges += 1

            powerup_add = False
            powerup_type = None
            powerup_effect = None
            powerup_position = None

            if not self.active_powerup and self.powerup_mode:
                self.wait_powerup += 1
                await self.reset_powerup_changes()
                if self.wait_powerup >= Costants.WAIT_POWERUP:
                    self.active_powerup = PowerUp()
                    powerup_add = True
                    powerup_type = self.active_powerup.type
                    powerup_effect = self.active_powerup.effect
                    powerup_position = self.active_powerup.position
            elif self.powerup_mode:
                await self.handle_powerup(player)

            # Send exchanges + powerup
            await self.channel_layer.group_send(self.id, {
                'type' : 'game_message',
                'event' : 'exchanges',
                'message' : {
                    'exchanges' : self.exchanges,
                    'add_powerup' : powerup_add,
                    'powerup_type' : powerup_type,
                    'powerup_effect' : powerup_effect,
                    'powerup_position' : powerup_position,
                },
            })

    async def ball_player_collision(self):
        if self.event_update:
            return

        if self.ball.check_limit_x():
            if self.ball.direction.x > 0:
                await self.handle_player_collision(self.player2)
            elif self.ball.direction.x < 0:
                await self.handle_player_collision(self.player1)


    async def wall_collision(self):
        if self.event_update:
            return
        if self.ball.check_limit_y():
            self.event_update = True
            limit = Costants.MAX_PADDLE_Y if self.ball.position.y > Costants.MAX_PADDLE_Y else Costants.MIN_PADDLE_Y
            self.ball.direction.y *= -1
            self.ball.position.y = limit
            await self.channel_layer.group_send(self.id,  {
                'type' : 'game_message',
                'event' : 'soundWallCollision',
                'message' : {},
                })

    async def check_point(self):
        if self.event_update:
            return
        if self.ball.check_limit_x():
            self.event_update = True
            scorer = self.player1 if self.ball.position.x > 0 else self.player2
            if scorer == self.player1:
                self.score1 += 1
            else:
                self.score2 += 1

            self.exchanges = 0
            self.player1.reset()
            self.player2.reset()
            self.ball.reset()
            self.ball_await = Costants.BALL_AWAIT
            self.update_ball_await = time.time()

            # Sound point event send
            await self.channel_layer.group_send(self.id, {
                'type' : 'game_message',
                'event' : 'soundPoint',
                'message' : {},
            })

            # Score event
            await self.channel_layer.group_send(self.id, {
                'type' : 'game_message',
                'event' : 'score',
                'message' : {
                    'player_one' : self.score1,
                    'player_two' : self.score2,
                },
            })

            # Exchanges reset
            await self.channel_layer.group_send(self.id, {
                'type' : 'game_message',
                'event' : 'exchanges',
                'message' : {
                    'exchanges' : 0,
                },
            })

            # Powerup reset
            await self.reset_powerup_changes()
            self.active_powerup = None
            self.wait_powerup = 0

            await self.channel_layer.group_send(self.id, {
                'type' : 'game_message',
                'event' : 'handle_powerup',
                'message' : {
                    'type' : 'powerup_remove',
                },
            })

            # Check game ended
            if self.score1 == Costants.MAX_SCORE or self.score2 == Costants.MAX_SCORE:
                self.ended = True

    def update_ball(self, delta_time):
        self.ball.update(delta_time)

    def update_player(self, delta_time):
        if self.player1.move['up'] and self.player1.position.y < Costants.MAX_PADDLE_Y:
            self.player1.position.y += self.player1.speed * delta_time
        if self.player1.move['down'] and self.player1.position.y > Costants.MIN_PADDLE_Y:
            self.player1.position.y -= self.player1.speed * delta_time
        if self.player2.move['up'] and self.player2.position.y < Costants.MAX_PADDLE_Y:
            self.player2.position.y += self.player2.speed * delta_time
        if self.player2.move['down'] and self.player2.position.y > Costants.MIN_PADDLE_Y:
            self.player2.position.y -= self.player2.speed * delta_time

    def move(self, consumer, data):

        if not consumer:
            return

        player: Player = None
        if self.player1.consumer == consumer:
            player = self.player1
        elif self.player2.consumer == consumer:
            player = self.player2
        if not player:
            return

        if not data['type'] or not data['direction'] or not data['mode']:
            return

        if not data['type'] == 'input':
            return

        if data['direction'] == 'up':
            if data['mode'] == 'keydown':
                player.move['up'] = True
            elif data['mode'] == 'keyup':
                player.move['up'] = False
        elif data['direction'] == 'down':
            if(data['mode'] == 'keyup'):
                player.move['down'] = False
            elif data['mode'] == 'keydown':
                player.move['down'] = True

    async def update(self):

        try:
            if not self.update_time:
                self.update_time = time.time()

            now = time.time() - self.update_time

            if now < Costants.REFRESH_RATE:
                await asyncio.sleep(Costants.REFRESH_RATE - now)

            delta_time = time.time() - self.update_time
            self.update_player(delta_time)

            if self.ball_await > 0 and time.time() - self.update_ball_await < self.ball_await:
                self.update_time = time.time()
                return

            self.ball_await = 0

            self.update_ball(delta_time)

            self.event_update = False

            await self.wall_collision()

            await self.ball_player_collision()

            await self.powerup_collision()

            await self.check_point()

            self.update_state()

            self.update_time = time.time()
        except Exception as e:
            print(e)
