from django.db import models

# Create your models here.
class GameCustomizationData(models.Model):
	id = models.BigAutoField(primary_key=True)
	background = models.SmallIntegerField(default=0)
	palette = models.SmallIntegerField(default=0)
	bgColor = models.CharField(default="#ff0000")
	opacity = models.SmallIntegerField(default=0)
	sparks = models.BooleanField(default=True)