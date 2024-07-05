from django.db import models
from users.models import UserAccount

# Create your models here.
class GameCustomizationData(models.Model):
	id = models.BigAutoField(primary_key=True)
	user_id = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='player_settings')
	background = models.SmallIntegerField(default=0)
	palette = models.SmallIntegerField(default=0)
	bgColor = models.CharField(default="#ff0000")
	opacity = models.SmallIntegerField(default=0)
	sparks = models.BooleanField(default=True)

	class Meta:
		verbose_name = 'Game Customization Data'
		verbose_name_plural = 'Game Customization Data'

	def __str__(self):
		return f'[Game Settings] {self.user_id.login}'