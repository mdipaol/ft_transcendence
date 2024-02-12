from django.db import models

# ========== #
#   Models   #
# ========== #

# Player model class

class	Player(models.Model):
	nickname = models.CharField(max_length=20, unique=True)
	email = models.EmailField(unique=True)
	password = models.CharField()
	level = models.IntegerField()
	image = models.CharField()
	def __str__(self):
		return self.nickname

# Matches between users

class	Match(models.Model):
	player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player1")
	player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player2")
	score1 = models.IntegerField()
	score2 = models.IntegerField()
	date = models.DateField()
	finished = models.BooleanField()

# Messages

class	Message(models.Model):
	sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="sender")
	reciever = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="reciever")
	text = models.CharField(max_length=200)
	date = models.DateField()

# Types of relationship beetween users
	
class	TypeOfRelationship(models.TextChoices):
	FRIEND = "friend"
	BLOCKED = "blocked"

# Relationship

class	Relationship(models.Model):
	user1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="user1")
	user2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="user2")
	relationship = models.CharField(
		choices=TypeOfRelationship.choices,
		default=TypeOfRelationship.FRIEND,
		)
