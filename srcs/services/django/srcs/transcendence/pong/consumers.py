
import uuid, json, pdb, asyncio
from asgiref.sync import sync_to_async
from asgiref.sync import async_to_sync

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
        self.powerup_mode = False
        self.db_match_id = None

    async def connect(self):

        self.user = self.scope['user']
        self.powerup_mode = self.scope["url_route"]["kwargs"].get("powerup_mode") == 'powerup'

        self.db_match_id : int = self.scope["url_route"]["kwargs"].get("id")

        print(self.db_match_id)

        if self.user and self.user.is_authenticated:
            self.username = self.user.username
        
        if self.db_match_id:
            self.match = await MatchManager.add_player_id(self, self.db_match_id)
        else:
            self.match =  await MatchManager.add_player(self)

        if self.match == None:
            print('match')
            print(None)
            await self.close()

        await self.accept()

    async def disconnect(self, close_code):

        # Game logic
        if self.db_match_id:
            await MatchManager.delete_player_id(self, self.db_match_id)
        else:
            await MatchManager.delete_player(self)



    async def receive(self, text_data):
        data = json.loads(text_data)
        if not data['type']:
            return
        if data['type'] == 'input':
            self.match.move(self, data)
        if data['type'] == 'ready':
            self.match.ready(self)

    async def game_start(self, event):

        await self.send(text_data=json.dumps({
            "type": "game_start",
            "player": event['player'],
            'username_one' : event['username_one'],
            'username_two' : event['username_two'],
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
        if user.is_authenticated:
            self.add_connection(user)
            async_to_sync(self.channel_layer.group_add)(
                f"notifications_{str(user.id)}", self.channel_name
            )
            self.accept()
            self.send(text_data=json.dumps({'username' : user.username}))
        else:
            self.close()

    def disconnect(self, status_code):
        user = self.scope['user']
        if not user.is_anonymous:
            async_to_sync(self.channel_layer.group_discard)(
                f"notifications_{str(user.id)}", self.channel_name
            )
        self.del_connection(user)

    def receive(self, text_data):
        ...

    def send_notification(self, event):
        print(event)
        (self.send)(text_data=json.dumps({
            'type' : event.get('type'),
            'message' : event.get('message'),
        }))

    def add_connection(self, user):
        BaseUser.objects.filter(pk=user.pk).update(online=F('online') + 1)

    def del_connection(self, user):
        BaseUser.objects.filter(pk=user.pk).update(online=F('online') - 1)
