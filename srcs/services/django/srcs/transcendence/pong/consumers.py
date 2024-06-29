
import uuid, json, pdb, asyncio
from asgiref.sync import sync_to_async

from .game_class import Match
from .match_manager import MatchManager
from .models import BaseUser

from django.db.models import F
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer

# Game sockets with asyncio

class AsyncGameConsumer(AsyncWebsocketConsumer):

    def __init__(self):
        super().__init__(self)
        self.username: str = 'Anonymous'
        self.player_id: str = str(uuid.uuid4())
        self.match: Match = None

    async def connect(self):

        self.user = self.scope['user']

        if self.user and self.user.is_authenticated:
            self.username = self.user.username

        self.match =  await MatchManager.add_player(self)

        await self.accept()

    async def disconnect(self, close_code):

        # Game logic
        await MatchManager.delete_player(self)
        ...


    async def receive(self, text_data):

        direction = json.loads(text_data).get("direction")
        # self.match.paddle_move(self.player_id, direction)
        self.match.move(self, direction)

    # Channel layers message handlers

    async def game_start(self, event):

        await self.send(text_data=json.dumps({
            "type": "game_start",
            "player": event['player']
            }))

    async def game_message(self, event):

        await self.send(text_data=json.dumps({
            "type": "game_message",
            "event": event['event'],
            "message": event['message'],
            }))

    async def game_end(self, event):

        await self.send(text_data=json.dumps({
            "type": "game_end",
            'message' : event['message'],
            }))

        await self.close()

# Chat sockets

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user = self.scope["user"]
        username = "Anonymous"
        if user.is_authenticated:
            username = user.username
        message = username + ": " + text_data_json["message"]

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))

# Online status consumer

class OnlineConsumer(WebsocketConsumer):

    def connect(self):
        user = self.scope['user']
        self.add_connection(user)
        self.accept()

    def disconnect(self, status_code):
        user = self.scope['user']
        self.del_connection(user)

    def add_connection(self, user):
        BaseUser.objects.filter(pk=user.pk).update(online=F('online') + 1)

    def del_connection(self, user):
        BaseUser.objects.filter(pk=user.pk).update(online=F('online') - 1)
