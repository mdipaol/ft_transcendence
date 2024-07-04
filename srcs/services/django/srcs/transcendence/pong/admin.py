from django.contrib import admin

# Register your models here.

# from .models import Player, Match, Message, Relationship

# admin.site.register(Player)
# admin.site.register(Match)
# admin.site.register(Message)
# admin.site.register(Relationship)

from .models import BaseUser, Match, Group, Message, Tournament, TournamentPartecipant, TournamentMatch

admin.site.register(BaseUser)
admin.site.register(Match)
admin.site.register(Group)
admin.site.register(Message)
admin.site.register(Tournament)
admin.site.register(TournamentPartecipant)
admin.site.register(TournamentMatch)
