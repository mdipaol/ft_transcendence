from django.db import models

import datetime

from django.contrib.auth.models import AbstractUser

class BaseUser(AbstractUser):
	level = models.FloatField(default=0)
	image = models.CharField(max_length=255)

class Match(models.Model):
	base_users = models.ManyToManyField(BaseUser)
	# user1 = models.ForeignKey()
	# user2 = models.ForeignKey()
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