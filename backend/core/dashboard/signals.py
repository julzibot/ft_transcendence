from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import DashboardData
from .serializers import DashboardSerializer

@receiver(pre_save, sender=DashboardData)
def	preSaveDashboard(sender, instance, **kwargs):
	if instance.prev_result:
		instance.streak += 1
	else:
		instance.streak = 0
	print('Dashboard data pre_save')

@receiver(pre_save, sender=DashboardSerializer)
def	preSaveDashboardSerializer(sender, instance, **kwargs):
	if instance.prev_result:
		instance.streak += 1
	else:
		instance.streak = 0
	print('Serializer Dashboard data pre_save')