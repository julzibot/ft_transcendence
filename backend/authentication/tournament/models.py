from django.db import models
from .models import Game, UserAccount

# Create your models here.
class Tournament(models.Model):
    id = models.BigAutoField(primary_key=True)
    players = models.ManyToManyField(UserAccount)
    games = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='games')
    date = models.DateTimeField(auto_now_add=True)
    points_per_game = models.PositiveSmallIntegerField(default=0)
    time_per_game = models.PositiveIntegerField(default=120)
