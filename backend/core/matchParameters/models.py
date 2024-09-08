from django.db import models
from users.models import UserAccount

# Create your models here.
class MatchParametersData(models.Model):
	id = models.BigAutoField(primary_key=True)
	user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, null=True, related_name='match_parameters')
	points_to_win = models.SmallIntegerField(default=1)
	game_difficulty = models.SmallIntegerField(default=3)
	power_ups = models.BooleanField(default=True)