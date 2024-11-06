from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import UserAccount
from uuid import uuid4


class GAME_MODE_CHOICES(models.TextChoices):
  ONLINE = 'ONLINE',
  TOURNAMENT= 'TOURNAMENT'

class LobbyData(models.Model):
    name = models.CharField(max_length=60, unique=False)
    lobbyWinner = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='winner_lobby')
    difficultyLevel = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(7)], default=4)
    pointsPerGame = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(21)], default=10)
    power_ups = models.BooleanField(default=False)
    linkToJoin = models.UUIDField(default=uuid4, editable=False)
    gameMode = models.CharField(max_length=10, choices=GAME_MODE_CHOICES.choices, default=GAME_MODE_CHOICES.ONLINE)
    tournamentLink = models.UUIDField(null=True, blank=True)
    creator = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='lobby_creator')
    player1 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='lobby_player1')
    player2 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='lobby_player2')

    @property
    def isFull(self):
      return self.player1 is not None and self.player2 is not None
    class Meta:
      verbose_name = 'Lobby'
      verbose_name_plural = 'Lobbies'