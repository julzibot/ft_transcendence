from django.db import models
from users.models import UserAccount
from tournament.models import TournamentModel

class GameChoices(models.IntegerChoices):
	LOCAL = 0, 'Local'
	AI = 1, 'AI'
	ONLINE = 2, 'Online'
	TOURNAMENT = 3, 'Tournament'

class GameMatch(models.Model):
  tournament = models.ForeignKey(TournamentModel, related_name='tournament_gamehistory', null=True, on_delete=models.CASCADE)
  game_mode = models.PositiveSmallIntegerField(
		choices=GameChoices.choices,
		default=GameChoices.LOCAL)
  player1 = models.ForeignKey(UserAccount, related_name='player1_gamehistory', null=True, on_delete=models.CASCADE)
  player2 = models.ForeignKey(UserAccount, related_name='player2_gamehistory', blank=True, null=True, on_delete=models.CASCADE)
  score1 = models.PositiveIntegerField(default=0)
  score2 = models.PositiveIntegerField(default=0)
  date = models.DateField(auto_now_add=True)

  class Meta:
    verbose_name = 'Game Match'
    verbose_name_plural = 'Game Matches'