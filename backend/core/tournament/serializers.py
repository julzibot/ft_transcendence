from rest_framework import serializers
from .models import TournamentModel, ParticipantModel

class ParticipantSerializer(serializers.ModelSerializer):
	user = serializers.SerializerMethodField()

	class Meta:
		model = ParticipantModel
		fields = ['user', 'wins', 'gamesPlayed', 'tournament']
	
	def get_user(self, obj):
		return {
			'id': obj.user.id,
			'username': obj.user.username,
			'image': obj.user.image.url
	}

class TournamentSerializer(serializers.ModelSerializer):
	creator = serializers.SerializerMethodField()
	participants = ParticipantSerializer(source="players", many=True, read_only=True)

	class Meta:
		model = TournamentModel
		fields = ['id', 'name', 'maxPlayerNumber', 'timer', 'power_ups', 'difficultyLevel', 'pointsPerGame', 'isStarted', 'creator', 'numberOfPlayers', 'linkToJoin', 'participants', 'isFinished']
		read_only_fields = ['participants']

	def get_creator(self, obj):
		return {
			'id': obj.creator.id,
			'username': obj.creator.username,
			'image': obj.creator.image.url
		}

