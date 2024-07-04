from rest_framework import serializers
from .models import LobbyData

class LobbySerializer(serializers.ModelSerializer):
	class Meta:
		model = LobbyData
		fields = ['id', 'name', 'numberOfPlayers', 'lobbyWinner', 'isPrivate', 'difficultyLevel', 'isActiveLobby', 'pointsPerGame', 'timer', 'powerUps', 'round', 'gameName']