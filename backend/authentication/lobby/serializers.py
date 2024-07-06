from rest_framework import serializers
from .models import LobbyData

class LobbySerializer(serializers.ModelSerializer):
	class Meta:
		model = LobbyData
		fields = ['id', 'name', 'lobbyWinner', 'isPrivate', 'difficultyLevel', 'isActiveLobby', 'pointsPerGame', 'timer', 'powerUps', 'round', 'gameName', 'linkToJoin', 'player1', 'player2']