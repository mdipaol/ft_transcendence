# chat/routing.py
from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    path('ws/online/', consumers.OnlineConsumer.as_asgi()),
    re_path(r'ws/game/(?P<powerup_mode>\w+)/$', consumers.AsyncGameConsumer.as_asgi()),
    re_path(r"ws/game/(?P<powerup_mode>\w+)/(?P<id>\d+)/$", consumers.AsyncGameConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
]