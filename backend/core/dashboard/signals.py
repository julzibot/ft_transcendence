from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DashboardData
from .serializers import DashboardSerializer

@receiver(post_save, sender=DashboardData)
def	preSaveDashboard(sender, instance, **kwargs):
	if instance.prev_result == True:
		instance.current_streak += 1
		if instance.current_streak > instance.record_streak:
			instance.record_streak = instance.current_streak
		instance.prev_result = False
	else:
		instance.current_streak = 0
	instance.save()
	print('Dashboard data pre_save')

@receiver(post_save, sender=DashboardSerializer)
def	preSaveDashboardSerializer(sender, instance, **kwargs):
	if instance.prev_result == True:
		instance.current_streak += 1
		if instance.current_streak > instance.record_streak:
			instance.record_streak = instance.current_streak
		instance.prev_result = False
	else:
		instance.current_streak = 0
	instance.save()
	print('Serializer Dashboard data pre_save')