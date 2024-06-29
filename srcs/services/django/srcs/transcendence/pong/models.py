from django.db import models

import datetime

from django.contrib.auth.models import AbstractUser

class BaseUser(AbstractUser):
	level = models.FloatField(default=0)
	image = models.ImageField(upload_to='images/')
	online = models.IntegerField(default=0)

class Match(models.Model):
	player1 = models.ForeignKey(BaseUser, related_name='player_one', on_delete=models.CASCADE)
	player2 = models.ForeignKey(BaseUser, related_name='player_two', on_delete=models.CASCADE)
	score1 = models.IntegerField()
	score2 = models.IntegerField()
	date = models.DateTimeField()

class Group(models.Model):
	base_users = models.ManyToManyField(BaseUser)

class Message(models.Model):
	sender = models.ForeignKey(BaseUser, on_delete=models.CASCADE)
	group_id = models.ForeignKey(Group, on_delete=models.CASCADE)
	text = models.CharField(max_length=255)
	timestamp = models.DateTimeField()

class Tournament(models.Model):
	matches = models.ManyToManyField(Match)
	start = models.DateTimeField(default=datetime.datetime.now())
	end = models.DateTimeField(null=True)
	ended = models.BooleanField(default=False)
