from django.db import models
from users.models import UserAccount

# Create your models here.
class GameCustomizationData(models.Model):
	id = models.BigAutoField(primary_key=True)
	user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True, related_name='player_settings')
	background = models.SmallIntegerField(default=0)
	palette = models.SmallIntegerField(default=0)
	bgColor = models.CharField(default="#ff0000")
	opacity = models.SmallIntegerField(default=80)
	sparks = models.BooleanField(default=True)

	class Meta:
		verbose_name = 'Game Customization Data'
		verbose_name_plural = 'Game Customizations'

	def __str__(self):
		try:
			return f'[Game Settings] [{self.user.username}]'
		except:
			return f'[Game Settings] [{self.user.id}]'
