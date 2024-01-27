from django.db import models

# Create your models here.

class	User(models.Model):
	nickname = models.CharField(max_length=20)
	email = models.EmailField(uniqe=True)
	password = models.CharField()
	def __str__(self):
		return self.nickname


class	Match(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE)
	player2 = models.ForeignKey(User, on_delete=models.CASCADE)
	score1 = models.IntegerField()
	score2 = models.IntegerField()
	date = models.DateField()
	played = models.BooleanField()
	def __str__(self):
		return self