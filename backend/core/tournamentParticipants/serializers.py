from rest_framework import serializers
from .models import TournamentParticipants

class TournamentParticipantsSerializer(serializers.ModelSerializer):
	user_name = serializers.CharField(source='user.username')
	class Meta:
		model = TournamentParticipants
		fields = ['id', 'tournament_id', 'user_id', 'isEliminated', 'user_name']