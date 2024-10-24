from rest_framework import serializers
from .models import LobbyData

class LobbySerializer(serializers.ModelSerializer):
	player1 = serializers.SerializerMethodField()
	player2 = serializers.SerializerMethodField()
	creator = serializers.SerializerMethodField()
	
	class Meta:
		model = LobbyData
		fields = ['id', 'name', 'lobbyWinner', 'power_ups', 'difficultyLevel', 'pointsPerGame', 'linkToJoin', 'player1', 'player2', 'isFull', 'creator']
	
	def get_player1(self, obj):
		if obj.player1:
			return {
				'id': obj.player1.id,
				'username': obj.player1.username,
				'image': obj.player1.image.url
			}
		return None
	def get_player2(self, obj):
		if obj.player2:
			return {
				'id': obj.player2.id,
				'username': obj.player2.username,
				'image': obj.player2.image.url
			}
		return None
	
	def get_creator(self, obj):
		if obj.creator:
			return {
				'id': obj.creator.id,
				'username': obj.creator.username,
				'image': obj.creator.image.url
			}
		return None