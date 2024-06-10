from rest_framework import serializers
from .models import TournamentParticipants

class TournamentParticipantsSerializer(serializers.ModelSerializer):
	class Meta:
		model = TournamentParticipants
		fields = ['id', 'tournamentId', 'user_id', 'isEliminated']