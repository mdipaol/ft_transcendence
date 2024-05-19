from django.apps import AppConfig

class PongConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pong'

    # def ready(self):
    #     from .models import BaseUser
    #     users = BaseUser.objects.all()
    #     for user in users:
    #         user.online = 0
    #         user.save()