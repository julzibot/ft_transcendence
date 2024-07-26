from rest_framework import serializers
from .models import DashboardData

class DashboardSerializer(serializers.ModelSerializer):
	class Meta:
		model = DashboardData
		fields = ['user', 'games_played', 'wins', 'record_streak', 'tournaments_won', 'tournaments_played']