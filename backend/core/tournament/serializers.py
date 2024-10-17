from rest_framework import serializers
from .models import TournamentModel, ParticipantModel

class TournamentSerializer(serializers.ModelSerializer):
	creator = serializers.SerializerMethodField()

	class Meta:
		model = TournamentModel
		fields = ['id', 'name', 'maxPlayerNumber', 'timer', 'power_ups', 'difficultyLevel', 'pointsPerGame', 'isStarted', 'creator', 'numberOfPlayers', 'linkToJoin']

	def get_creator(self, obj):
		return {
			'id': obj.creator.id,
			'username': obj.creator.username,
			'image': obj.creator.image.url
		}

class ParticipantSerializer(serializers.ModelSerializer):
	user = serializers.SerializerMethodField()

	class Meta:
		model = ParticipantModel
		fields = ['user', 'wins', 'gamesPlayed']
	
	def get_user(self, obj):
		return {
			'id': obj.user.id,
			'username': obj.user.username,
			'image': obj.user.image.url
	}
