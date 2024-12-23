from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status

from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import LobbyData
from .serializers import LobbySerializer
from users.models import UserAccount
import uuid

@method_decorator(csrf_exempt, name='dispatch') # TO DO: remove this line
class LobbyView(APIView):
	permission_classes = [AllowAny]

	def get(self, request): # Get all lobbies
		lobbies = LobbyData.objects.filter(Q(lobbyWinner__isnull=True) | Q(lobbyWinner = None))
		serializer = LobbySerializer(lobbies, many=True)
		return Response(serializer.data)

	def post(self, request): # Create a new lobby
		data = request.data.copy()
		try:
			if 'player1' not in data:
				raise ObjectDoesNotExist
			player1 = UserAccount.objects.get(id=data['player1'])
		except ObjectDoesNotExist:
			return Response({'message': 'Creator not found'}, status=status.HTTP_400_BAD_REQUEST)
			
		serializer = LobbySerializer(data=data)
		if serializer.is_valid():
			validated_data = serializer.validated_data
			lobby = LobbyData.objects.create(
				name=validated_data['name'],
				difficultyLevel=validated_data['difficultyLevel'],
				pointsPerGame=validated_data['pointsPerGame'],
				power_ups=validated_data['power_ups'],
				player1=player1,
				creator=player1,
			)
			if('gameMode' in data and data['gameMode'] == 'TOURNAMENT'):
				lobby.gameMode = data['gameMode']
				lobby.tournamentLink = data['tournamentLink']
				lobby.save()
			return Response({
				'lobbyId': lobby.linkToJoin,
			}, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JoinLobbyView(APIView):
	def post(self, request):
		print(request.data)
		lobbyId = request.data['lobbyId']
		userId = request.data['userId']
		try:
			user = UserAccount.objects.get(id=userId)
			lobby = LobbyData.objects.get(linkToJoin=lobbyId)
		except ObjectDoesNotExist:
			return Response({'message': 'This Lobby does not exists'}, status=status.HTTP_404_NOT_FOUND)
		if lobby.player1 is not None and lobby.player2 is not None:
			return Response({'message': 'Lobby is full'}, status=status.HTTP_400_BAD_REQUEST)
		if lobby.player1 is None:
			lobby.player1 = user
		if lobby.player2 is None:
			lobby.player2 = user
		lobby.save()
		return Response({'message': 'You have joined the lobby successfully'}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch') # TO DO: remove this line
class LobbyDataView(APIView):
	permission_classes = [AllowAny]
	def get(self, request, linkToJoin):
		try:
			uuid.UUID(linkToJoin, version=4)
		except ValueError:
			return Response({'message': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			lobby = LobbyData.objects.get(linkToJoin=linkToJoin)
		except ObjectDoesNotExist:
			return Response({'message': 'Lobby not found'}, status=status.HTTP_404_NOT_FOUND)
		serializer = LobbySerializer(lobby)
		return Response(serializer.data)

	def put(self, request, linkToJoin):
		try:
			uuid.UUID(linkToJoin, version=4)
		except ValueError:
			return Response({'message': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			user = UserAccount.objects.get(id=request.data['userId'])
			lobby = LobbyData.objects.get(linkToJoin=linkToJoin)
		except ObjectDoesNotExist:
			return Response({'message': 'Lobby or User Account not found'}, status=status.HTTP_404_NOT_FOUND)
		try:
			if lobby.player1.id == user.id:
				lobby.player1 = None
			elif lobby.player2.id == user.id:
				lobby.player2 = None
			lobby.save()
		except:
			return Response(status=status.HTTP_400_BAD_REQUEST)
		return Response({'message': 'Lobby Saved Successfully'}, status=status.HTTP_200_OK)


	def delete(self, request, linkToJoin):
		try:
			uuid.UUID(linkToJoin, version=4)
		except ValueError:
			return Response({'message': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			lobby = LobbyData.objects.get(linkToJoin=linkToJoin)
		except ObjectDoesNotExist:
			return Response({'message': 'Lobby not found'}, status=status.HTTP_404_NOT_FOUND)
		lobby.delete()
		return Response({'message': 'Lobby deleted successfully'}, status=status.HTTP_204_NO_CONTENT)



	

