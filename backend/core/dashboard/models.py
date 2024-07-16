from django.db import models
from users.models import UserAccount

# Create your models here.
class DashboardData(models.Model):
	user_id = models.ForeignKey(UserAccount, related_name='user_id', on_delete=models.CASCADE)

	wins = models.IntegerField(default=0)
	prevResult = models.BooleanField(default=False)
	streak = models.IntegerField(default=0)
	games_played = models.IntegerField(default=0)

	tournaments_won = models.IntegerField(default=0)
	tournaments_played = models.IntegerField(default=0)

	class Meta:
		verbose_name = 'Dashboard Data'
		verbose_name_plural = 'Dashboard Data'

	def __str__(self):
		try:
			return f'[Dashboard Data] {self.user_id.nick_name}'
		except:
			return f'[Dashboard Data] {self.user_id}'

