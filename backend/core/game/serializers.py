from rest_framework import serializers
from .models import GameMatch
from users.serializers import UserAccountSerializer

class GameMatchSerializer(serializers.ModelSerializer):
	player1 = UserAccountSerializer(read_only=True)
	player2 = UserAccountSerializer(read_only=True)
	class Meta:
		model = GameMatch
		fields = '__all__'