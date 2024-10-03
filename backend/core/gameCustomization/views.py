from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import GameCustomizationData
from users.models import UserAccount
from .serializers import GameCustomizationSerializer

# Create your views here.
class GameCustomizationView(APIView):
	def get(self, request, id):
		try:
			user = UserAccount.objects.get(id=id)
			settings = GameCustomizationData.objects.get(user=user)
			serializer = GameCustomizationSerializer(settings)
			return Response({'data': serializer.data}, status=status.HTTP_200_OK)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[{id}] User Not Found'}, status=status.HTTP_404_NOT_FOUND)
		except GameCustomizationData.DoesNotExist:
			return Response({'message': '204 No Settings'}, status=status.HTTP_204_NO_CONTENT)

class UpdateGameCustomizationView(APIView):
	def post(self, request):
		data = request.data
		user_id = data.get('user')
		
		try:
			user = UserAccount.objects.get(id=user_id)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[{id}] User Not Found'}, status=status.HTTP_404_NOT_FOUND)

		try:
			obj = GameCustomizationData.objects.get(user=user_id)
			obj.background = data['background']
			obj.palette = data['palette']
			obj.bgColor = data['bgColor']
			obj.opacity = data['opacity']
			obj.sparks = data['sparks']
			obj.save()
			return Response({'message': 'Game Customization Settings Updated Successfully'}, status=status.HTTP_202_ACCEPTED)
		except GameCustomizationData.DoesNotExist:
			newObj = GameCustomizationData.objects.create(user=user, background=data['background'], palette=data['palette'], bgColor=data['bgColor'], opacity=data['opacity'], sparks=data['sparks'])
			newObj.save()
			return Response({'message': 'Game Customization Settings Created Successfully'}, status=status.HTTP_202_ACCEPTED)