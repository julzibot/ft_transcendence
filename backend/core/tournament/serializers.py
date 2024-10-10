from rest_framework import serializers
from .models import TournamentModel

class TournamentSerializer(serializers.ModelSerializer):
	class Meta:
		model = TournamentModel
		fields = ['name', 'maxPlayerNumber', 'timer', 'power_ups', 'difficultyLevel', 'pointsPerGame', 'isStarted']
