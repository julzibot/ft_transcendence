from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DashboardData

@receiver(post_save, sender=DashboardData)
def	postSaveDashboard(sender, instance, **kwargs):
	if instance.prev_result == True:
		instance.current_streak += 1
		if instance.current_streak > instance.record_streak:
			instance.record_streak = instance.current_streak
		instance.prev_result = False
	else:
		instance.current_streak = 0
	DashboardData.objects.filter(id=instance.id).update(
		current_streak=instance.current_streak,
		record_streak=instance.record_streak,
		prev_result=instance.prev_result
	)
	print('Dashboard data post_save')
