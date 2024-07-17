from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q

from users.models import UserAccount
from .models import GameMatch
from .serializers import GameMatchSerializer

class GameHistory(APIView):
	def get(self, request, id=None):
		if id is not None:
			try:              
				history = GameMatch.objects.get(id=id)
				serializer = GameMatchSerializer(history)
				return Response({'data': serializer.data}, status=status.HTTP_200_OK)
			except GameMatch.DoesNotExist:
				return Response({'message': 'Match does not exist'}, status=status.HTTP_404_NOT_FOUND)
		else:
			history = GameMatch.objects.all()
			if not history.exists():
				return Response({'message': 'No match history'}, status=status.HTTP_404_NOT_FOUND)
			serializer = GameMatchSerializer(history, many=True)
			return Response({'data': serializer.data}, status=status.HTTP_200_OK)
				
class UserGameHistory(APIView):
	def get(self, request, id):
		try:
			user = UserAccount.objects.get(id=id)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[{id}] User not found'}, status=status.HTTP_404_NOT_FOUND)
				
		history = GameMatch.objects.filter(Q(player1=user) | Q(player2=user))
		if not history.exists():
			return Response({'message': f'[{user.nick_name}] No match history'}, status=status.HTTP_404_NOT_FOUND)
		serializer = GameMatchSerializer(history, many=True)
		return Response({'data': serializer.data}, status=status.HTTP_200_OK)

# Need to find a way to POST player2's user id
class	GameDataView(APIView):
		def post(self, request):
			data = request.data
			user1_id = data.get['player1']
			# user2_id = data.get['player2']
			if user1_id.exists():
							try:
								user1 = UserAccount.objects.get(id=user1_id)
							except UserAccount.DoesNotExist:
								return Response({'message': f'[{user1_id}] Player 1: Unknown User'}, status=status.HTTP_404_NOT_FOUND)
			# if user2_id.exists():
			# 				try:
			# 					user2 = UserAccount.objects.get(id=user2_id)
			# 				except UserAccount.DoesNotExist:
			# 					return Response({'message': f'[{user2_id}] Player 2: Unknown User'}, status=status.HTTP_404_NOT_FOUND)

			new_game = GameMatch.objects.create(player1=user1)
			return Response({'id': new_game.id}, status=status.HTTP_201_CREATED)

class UpdateGameInfos(APIView):
		def put(self, request):
				id = request.data['id']
				try:
					instance = GameMatch.objects.get(id=id)
				except GameMatch.DoesNotExist:
					return Response({'message': f'[{id}] Unknown Game Match'}, status=status.HTTP_404_NOT_FOUND)
				# instance = get_object_or_404(YourModel, pk=pk)
				instance.score1 = request.data['score1']
				instance.score2 = request.data['score2']
				instance.save()

				return Response({'message': 'scoring put in db'}, status=status.HTTP_200_OK)
				
		# def get(self, request):


