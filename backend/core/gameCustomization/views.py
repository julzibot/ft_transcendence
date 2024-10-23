from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import GameCustomizationData
from users.models import UserAccount
from .serializers import GameCustomizationSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class GameCustomizationView(APIView):
	permission_classes = [AllowAny]
	def get(self, request, id):
		try:
			user = UserAccount.objects.get(id=id)
			settings = GameCustomizationData.objects.get(user=user)
			serializer = GameCustomizationSerializer(settings)
			return Response(serializer.data, status=status.HTTP_200_OK)
		except UserAccount.DoesNotExist:
			return Response({'message': 'User Not Found'}, status=status.HTTP_404_NOT_FOUND)
		except GameCustomizationData.DoesNotExist:
			return Response({'message': '204 No Settings'}, status=status.HTTP_204_NO_CONTENT)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateGameCustomizationView(APIView):
	permission_classes = [AllowAny]
	def put(self, request):
		data = request.data
		user_id = data.get('user')
		
		try:
			user = UserAccount.objects.get(id=user_id)
			obj = GameCustomizationData.objects.get(user=user)
		except ObjectDoesNotExist:
			return Response({'message': 'User Not Found'}, status=status.HTTP_404_NOT_FOUND)
		serializer = GameCustomizationSerializer(obj, data=data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response({'message': 'Game Customization Settings Updated Successfully'}, status=status.HTTP_202_ACCEPTED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)