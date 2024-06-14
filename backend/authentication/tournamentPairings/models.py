from django.db import models
from users.models import UserAccount

# Create your models here.
class TournamentPairingData(models.Model):
    id = models.BigAutoField(primary_key=True)
    tournament_id = models.CharField(max_length=60, unique=False)
    player1 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='player1_id')
    player2 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='player2_id')
    winner = models.CharField(max_length=60, unique=False, blank=True, null=True)
    round_id = models.CharField(max_length=60, unique=False, blank=True, null=True)
    linkToJoin = models.CharField(max_length=60, unique=False, blank=True, null=True)

