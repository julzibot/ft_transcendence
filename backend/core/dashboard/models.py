from django.db import models
from django.db.models import Q
from users.models import UserAccount
from game.models import GameMatch

# Create your models here.
class DashboardData(models.Model):
	user = models.OneToOneField(UserAccount, related_name='user_dashboard', on_delete=models.CASCADE)

	record_streak = models.IntegerField(default=0)
	current_streak = models.IntegerField(default=0)
	prev_result = models.BooleanField(default=False)

	tournaments_won = models.IntegerField(default=0)
	tournaments_played = models.IntegerField(default=0)

	@property
	def games_played(self):
		return GameMatch.objects.filter(Q(player1=self.user) | Q(player2=self.user)).count()
	
	@property
	def wins(self):
		games = GameMatch.objects.filter(Q(player1=self.user) | Q(player2=self.user))
		wins = 0
		for game in games:
			if (game.player1 == self.user and game.score1 > game.score2) or (game.player2 == self.user and game.score2 > game.score1):
				wins += 1
		return wins

	class Meta:
		verbose_name = 'Dashboard Data'
		verbose_name_plural = 'Dashboard Data'

	def __str__(self):
		try:
			return f'[Dashboard Data] {self.user.username}'
		except:
			return f'[Dashboard Data] {self.user.id}'
