from django.db import models

from django.contrib.auth.models import AbstractUser

class BaseUser(AbstractUser):
	level = models.IntegerField(default=0)
	iamge = models.CharField(max_length=255)

class Match(models.Model):
	base_users = models.ManyToManyField(BaseUser)
	score1 = models.IntegerField()
	score2 = models.IntegerField()
	date = models.DateField()

class Relationship(models.Model):
	RELATIONSHIP_TYPES = {
		'F': 'Friend',
		'B': 'Blocked',
	}
	base_users = models.ManyToManyField(BaseUser)
	relationship = models.CharField(choices=RELATIONSHIP_TYPES, max_length=1)
