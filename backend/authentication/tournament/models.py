from django.db import models

# Create your models here.
class TournamentData(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=60, unique=False)
    numberOfPlayers = models.PositiveIntegerField(default=120)
    tournamentWinner = models.CharField(max_length=60, unique=False, blank=True, null=True)
