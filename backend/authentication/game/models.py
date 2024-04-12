from django.db import models
from users.models import UserAccount

class Game(models.Model):
    id = models.BigAutoField(primary_key=True)
    player1 = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    # player2 = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    score1 = models.PositiveIntegerField(default=0)
    score2 = models.PositiveIntegerField(default=0)
    date = models.DateField(auto_now_add=True)
