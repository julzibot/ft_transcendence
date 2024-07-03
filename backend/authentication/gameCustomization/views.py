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
		try:
			settings = GameCustomizationData.objects.get(user_id=id)
			serializer = GameCustomizationSerializer(settings)
			return Response({'data': serializer.data}, status=status.HTTP_200_OK)
		except GameCustomizationData.DoesNotExist:
			return Response({'data': '404 Not Found'}, status=status.HTTP_404_NOT_FOUND)

class UpdateGameCustomizationView(APIView):
	def post(self, request):
		data = request.data

		user = get_object_or_404(UserAccount, id=data['userId'])

		obj = GameCustomizationData.objects.get(user_id=data['userId'])
		obj.background = data['background']
		obj.palette = data['palette']
		obj.bgColor = data['bgColor']
		obj.opacity = data['opacity']
		obj.sparks = data['sparks']
		obj.save()
		return Response({'message': 'Game customization settings updated successfully'}, status=status.HTTP_202_ACCEPTED)