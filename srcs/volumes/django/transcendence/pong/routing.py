# chat/routing.py
from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    # path('ws/game/', consumers.GameConsumer.as_asgi()),
    path('ws/game/<room_name>/', consumers.AsyncGameConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
]