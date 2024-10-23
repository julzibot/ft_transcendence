from rest_framework import serializers
from .models import GameCustomizationData

class GameCustomizationSerializer(serializers.ModelSerializer):
	class Meta:
		model = GameCustomizationData
		fields = ['background', 'palette', 'bgColor', 'opacity', 'sparks']