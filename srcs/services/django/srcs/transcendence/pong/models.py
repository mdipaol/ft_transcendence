import os
from django.db import models
from django.conf import settings

import datetime

from django.contrib.auth.models import AbstractUser

class BaseUser(AbstractUser):
	level = models.FloatField(default=0)
	image = models.ImageField(upload_to='images/', default=os.path.join(settings.STATIC_URL, 'pong/images/man.png'))
	online = models.IntegerField(default=0)

class Tournament(models.Model):
	name = models.CharField(max_length=255, unique=True)
	creator = models.ForeignKey(BaseUser, related_name='creator', on_delete=models.CASCADE, null=True, blank=True)
	number_of_partecipants = models.IntegerField(default=4)
	winner = models.ForeignKey(BaseUser, on_delete=models.CASCADE, related_name='winner', null=True, blank=True) # A winner can be a non partecipant?
	finished = models.BooleanField(default=False)

	def __str__(self):
		return self.name
	
	class Meta:
		ordering = ['name']

class TournamentPartecipant(models.Model):
	user = models.ForeignKey(BaseUser, related_name='alias_user', on_delete=models.CASCADE)
	tournament = models.ForeignKey(Tournament, related_name='tournament_of_partecipant', on_delete=models.CASCADE)
	alias = models.CharField(max_length=255, blank=True)

	class Meta:
		unique_together = ('user', 'tournament')
		ordering = ['tournament', 'alias']
		verbose_name = 'Tournament Partecipant'
		verbose_name_plural = 'Tournament Partecipants'

	def __str__(self):
		return str(self.id) + '-' + self.tournament.name + '-' + self.user.username

class Match(models.Model):
	player1 = models.ForeignKey(BaseUser, related_name='player_one', on_delete=models.CASCADE)
	player2 = models.ForeignKey(BaseUser, related_name='player_two', on_delete=models.CASCADE)
	score1 = models.IntegerField()
	score2 = models.IntegerField()
	date = models.DateTimeField()

	class Meta:
		verbose_name = 'Match'
		verbose_name_plural = 'Matches'

class TournamentMatch(models.Model):
	tournament = models.ForeignKey(Tournament, related_name='tournament_of_match', on_delete=models.CASCADE)
	match = models.ForeignKey(Match, related_name='match_of_tournament', on_delete=models.CASCADE)

	class Meta:
		unique_together = ('match', 'tournament')
		ordering = ['tournament']
		verbose_name = 'Tournament Match'
		verbose_name_plural = 'Tournament Matches'

class Group(models.Model):
	base_users = models.ManyToManyField(BaseUser)

class Message(models.Model):
	sender = models.ForeignKey(BaseUser, on_delete=models.CASCADE)
	group_id = models.ForeignKey(Group, on_delete=models.CASCADE)
	text = models.CharField(max_length=255)
	timestamp = models.DateTimeField()
