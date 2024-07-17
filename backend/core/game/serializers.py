from rest_framework import serializers
from .models import GameMatch

class GameMatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = GameMatch
		fields = '__all__'