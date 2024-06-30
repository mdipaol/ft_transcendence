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
	name = models.CharField(max_length=255, blank=True)
	creator = models.ForeignKey(BaseUser, related_name='creator', on_delete=models.CASCADE, null=True, blank=True)
	#OCCHIO FORSE SALVARE NUMERO PARTECIPANTI (4 o 8)
	number_of_partecipants = models.IntegerField(default=4)
	partecipants = models.ManyToManyField(BaseUser)
	# matches = models.ManyToManyField('Match', related_name='all_matches')
	winner = models.ForeignKey(BaseUser, on_delete=models.CASCADE, related_name='winner', null=True, blank=True)
	finished = models.BooleanField(default=False)

	# def clean(self):
	# 	super().clean()
	# 	num_participants = self.participants.count()
	# 	if num_participants not in [4, 8]:
	# 		raise ValidationError('Number of participants must be 4 or 8.')

	def __str__(self):
		return self.name

class Match(models.Model):
	player1 = models.ForeignKey(BaseUser, related_name='player_one', on_delete=models.CASCADE)
	player2 = models.ForeignKey(BaseUser, related_name='player_two', on_delete=models.CASCADE)
	score1 = models.IntegerField()
	score2 = models.IntegerField()
	date = models.DateTimeField()
	tournament = models.ForeignKey('Tournament', related_name='tournament_field', on_delete=models.CASCADE, null=True, blank=True)

class Group(models.Model):
	base_users = models.ManyToManyField(BaseUser)

class Message(models.Model):
	sender = models.ForeignKey(BaseUser, on_delete=models.CASCADE)
	group_id = models.ForeignKey(Group, on_delete=models.CASCADE)
	text = models.CharField(max_length=255)
	timestamp = models.DateTimeField()
