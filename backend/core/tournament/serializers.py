from rest_framework import serializers
from .models import TournamentModel

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
