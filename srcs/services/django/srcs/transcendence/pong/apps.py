from django.apps import AppConfig
from django.db.models.signals import post_migrate

class PongConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pong'

    def ready(self):
        import pong.signals
        post_migrate.connect(pong.signals.post_migrate_handler, sender=self)
    #     from .models import BaseUser
    #     users = BaseUser.objects.all()
    #     for user in users:
    #         user.online = 0
    #         user.save()