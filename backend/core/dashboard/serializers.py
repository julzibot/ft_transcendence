from rest_framework import serializers
from .models import DashboardData

class DashboardSerializer(serializers.ModelSerializer):
	class Meta:
		model = DashboardData
		fields = ['user_id', 'wins', 'losses']