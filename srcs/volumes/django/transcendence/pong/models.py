from django.db import models

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
	date = models.DateField()

# class Relationship(models.Model):
# 	RELATIONSHIP_TYPES = {
# 		'F': 'Friend',
# 		'B': 'Blocked',
# 	}
# 	base_users = models.ManyToManyField(BaseUser)
# 	relationship = models.CharField(choices=RELATIONSHIP_TYPES, max_length=1)

# transcendence=# select * from pong_match;
#  id | score1 | score2 | date 
# ----+--------+--------+------
# (0 rows)

# transcendence=# ^C
# transcendence=# select * from pong_match_base_users;
#  id | match_id | baseuser_id 
# ----+----------+-------------
# (0 rows)

# transcendence=# select * from pong_relationship_base_users;
#  id |   d | baseuser_id 
# ----+-----------------+-------------
# (0 rows)

# transcendence=# select * from pong_relationship;
#  id | relationship 
# ----+--------------
# (0 rows)

# transcendence=# 