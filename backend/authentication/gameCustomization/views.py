from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import GameCustomizationData
from users.models import UserAccount
from .serializers import GameCustomizationSerializer

# Create your views here.
class GameCustomizationView(APIView):
	def get(self, request, id):
		settings = GameCustomizationData.objects.filter(user_id=id)
		if settings.exists():
			serializer = GameCustomizationSerializer(settings, many=True)
			return Response({'data': serializer.data}, status=status.HTTP_200_OK)
		else:
			return Response({'data': '404 Not Found'}, status=status.HTTP_404_NOT_FOUND)

class UpdateGameCustomizationView(APIView):
	def post(self, request):
		data = request.data
		user = get_object_or_404(UserAccount, id=data['user_id'])

		objs = GameCustomizationData.objects.filter(user_id=data['user_id'])

		if (objs.exists()):
			for obj in objs:
				obj.background = data['background']
				obj.palette = data['palette']
				obj.bgColor = data['bgColor']
				obj.opacity = data['opacity']
				obj.sparks = data['sparks']
				obj.save()
			return Response({'message': 'Game customization settings updated successfully'}, status=status.HTTP_202_ACCEPTED)