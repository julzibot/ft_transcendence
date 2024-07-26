from django.db import models
from users.models import UserAccount

# Create your models here.
class DashboardData(models.Model):
	user = models.OneToOneField(UserAccount, related_name='user_dashboard', on_delete=models.CASCADE)

	games_played = models.IntegerField(default=0)
	wins = models.IntegerField(default=0)
	record_streak = models.IntegerField(default=0)
	current_streak = models.IntegerField(default=0)
	prev_result = models.BooleanField(default=False)

	tournaments_won = models.IntegerField(default=0)
	tournaments_played = models.IntegerField(default=0)

	class Meta:
		verbose_name = 'Dashboard Data'
		verbose_name_plural = 'Dashboard Data'

	def __str__(self):
		try:
			return f'[Dashboard Data] {self.user.nick_name}'
		except:
			return f'[Dashboard Data] {self.user.id}'

