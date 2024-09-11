from rest_framework import serializers
from .models import MatchParametersData

class MatchParametersSerializer(serializers.ModelSerializer):
	class Meta:
		model = MatchParametersData
		fields = fields = ['id', 'user', 'points_to_win', 'game_difficulty', 'power_ups']