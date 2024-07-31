from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q

from users.models import UserAccount
from .models import GameMatch
from .serializers import GameMatchSerializer
from dashboard.models import DashboardData

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

class	GameDataView(APIView):
	def post(self, request):
		data = request.data
		user1_id = data.get('player1')
		user2_id = data.get('player2')
		game_mode = data.get('game_mode')

		if user1_id is not None and game_mode is not None and (game_mode <= 3 and game_mode >= 0):
			try:
				user1 = UserAccount.objects.get(id=user1_id)
			except UserAccount.DoesNotExist:
				return Response({'message': f'[{user1_id}] Player 1: Unknown User'}, status=status.HTTP_404_NOT_FOUND)
			if game_mode >= 2:
				try:
					user2 = UserAccount.objects.get(id=user2_id)
				except UserAccount.DoesNotExist:
					return Response({'message': f'[{user2_id}] Player 2: Unknown User'}, status=status.HTTP_404_NOT_FOUND)
			new_game = GameMatch.objects.create(player1=user1, player2=user2, game_mode=game_mode)
			return Response({'id': new_game.id}, status=status.HTTP_201_CREATED)
		return Response({'message': '[POST] Invalid Game Match Creation Request'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateGameInfos(APIView):
	def put(self, request, id):
		try:
			game = GameMatch.objects.get(id=id)
		except GameMatch.DoesNotExist:
			return Response({'message': f'[{id}] Unknown Game Match'}, status=status.HTTP_404_NOT_FOUND)
		
		data = request.data
		score1 = data.get('score1')
		score2 = data.get('score2')
		if score1 is not None and score2 is not None:
			game.score1 = score1
			game.score2 = score2
			game.save()

			try:
				player1 = UserAccount.objects.get(user=game.player1)
			except UserAccount.DoesNotExist:
				return Response({'message': f'[PUT] [{game.id}] Unknown Player 1'}, status=status.HTTP_404_NOT_FOUND)
			if game.game_mode >= 2:
				try:
					player2 = UserAccount.objects.get(user=game.player2)
				except UserAccount.DoesNotExist:
					return Response({'message': f'[PUT] [{game.id}] Unknown Player 2'}, status=status.HTTP_404_NOT_FOUND)
			else:
				player2 = UserAccount.objects.create()

			if score1 > score2:
				winner = player1
				loser = player2
			else:
				loser = player1
				winner = player2

			winner.games_played += 1
			winner.wins += 1
			winner.prev_result = True
			winner.save()

			loser.games_played += 1
			loser.prev_result = False
			loser.save()

			if game.game_mode < 2:
				player2.delete()

			return Response({'message': f'[{id}]: Game Match Data Saved Successfully'}, status=status.HTTP_200_OK)
		return Response({'message': '[POST] Invalid Game Match Creation Request'}, status=status.HTTP_400_BAD_REQUEST)

