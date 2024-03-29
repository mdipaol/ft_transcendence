
import json

from channels.generic.websocket import AsyncWebsocketConsumer, Websocket

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        # Deserialize the received message
        game_data = json.loads(text_data)    
        response_data = json.dumps(game_data)
        await self.send(text_data=response_data)
