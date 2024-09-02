from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import MatchParametersData
from users.models import UserAccount
from .serializers import MatchParametersSerializer

# Create your views here.
class MatchParametersView(APIView):
	def get(self, request, id):
		try:
			user = UserAccount.objects.get(id=id)
			parameters = MatchParametersData.objects.get(user=id)
			serializer = MatchParametersSerializer(parameters)
			return Response({'data': serializer.data}, status=status.HTTP_200_OK)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[{id}] User Not Found'}, status=status.HTTP_404_NOT_FOUND)
		except MatchParametersData.DoesNotExist:
			return Response({'message': '204 No Parameters'}, status=status.HTTP_204_NO_CONTENT)

class UpdateMatchParametersView(APIView):
	def post(self, request):
		try:
			user_id = request.data.get('user')
			user = UserAccount.objects.get(id=user_id)
			try:
				parameters = MatchParametersData.objects.get(user=user_id)
				serialized = MatchParametersSerializer(instance=parameters, data=request.data)
				operation = 'Updated'
			except MatchParametersData.DoesNotExist:
				serialized = MatchParametersSerializer(data=request.data)
				operation = 'Created'
			
			if serialized.is_valid():
				serialized.save()
				return Response({'message': f'[{user.username}] Match Parameters {operation} Successfully'}, status=status.HTTP_202_ACCEPTED)
			else:
				return Response({'message': 'Invalid Match Parameters'}, status=status.HTTP_400_BAD_REQUEST)

		except UserAccount.DoesNotExist:
			return Response({'message': f'[{user_id}] User Not Found'}, status=status.HTTP_404_NOT_FOUND)