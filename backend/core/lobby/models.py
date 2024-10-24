from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import UserAccount
from uuid import uuid4

# Create your models here.
class LobbyData(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=60, unique=False)
    lobbyWinner = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='winner_lobby')
    difficultyLevel = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(7)], default=4)
    pointsPerGame = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(21)], default=10)
    power_ups = models.BooleanField(default=False)
    linkToJoin = models.UUIDField(default=uuid4, editable=False)
    creator = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='lobby_creator')
    player1 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='lobby_player1')
    player2 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='lobby_player2')

    @property
    def isFull(self):
      return self.player1 is not None and self.player2 is not None
    class Meta:
      verbose_name = 'Lobby'
      verbose_name_plural = 'Lobbies'