from django.db import models
from users.models import UserAccount

# Create your models here.
class DashboardData(models.Model):
	user_id = models.ForeignKey(UserAccount, related_name='user_id', on_delete=models.CASCADE)
	wins = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)

	class Meta:
		verbose_name = 'Dashboard Data'
		verbose_name_plural = 'Dashboard Data'

	def __str__(self):
		return f'Dashboard data for: {self.user_id.username}'

