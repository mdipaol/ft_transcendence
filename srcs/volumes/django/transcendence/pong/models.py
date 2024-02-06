from django.db import models

# ========== #
#   Models   #
# ========== #

# User model class

class	User(models.Model):
	nickname = models.CharField(max_length=20, unique=True)
	email = models.EmailField(unique=True)
	password = models.CharField()
	level = models.IntegerField()
	image = models.CharField()
	def __str__(self):
		return self.nickname

# Matches between users

class	Match(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE)
	player2 = models.ForeignKey(User, on_delete=models.CASCADE)
	score1 = models.IntegerField()
	score2 = models.IntegerField()
	date = models.DateField()
	finished = models.BooleanField()

# Messages

class	Message(models.Model):
	sender = models.ForeignKey(User, on_delete=models.CASCADE)
	reciever = models.ForeignKey(User, on_delete=models.CASCADE)
	text = models.CharField(max_length=200)
	date = models.DateField()

# Types of relationship beetween users
	
class	TypeOfRelationship(models.TextChoices):
	FRIEND = "friend"
	BLOCKED = "blocked"

# Relationship

class	Relationship(models.Model):
	user1 = models.ForeignKey(User, on_delete=models.CASCADE)
	user2 = models.ForeignKey(User, on_delete=models.CASCADE)
	relationship = models.CharField(
		choices=TypeOfRelationship.choices,
		default=TypeOfRelationship.FRIEND,
		)
