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
			else:
				new_game = GameMatch.objects.create(player1=user1, player2=None, game_mode=game_mode)
			return Response({'id': new_game.id}, status=status.HTTP_201_CREATED)
		return Response({'message': '[POST] Invalid Game Match Creation Request'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateLocalGame(APIView):
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
				player1 = UserAccount.objects.get(id=game.player1.id)
			except UserAccount.DoesNotExist:
				return Response({'message': f'[PUT] [{game.id}] Unknown Player 1'}, status=status.HTTP_404_NOT_FOUND)
			try:
				dashboard = DashboardData.objects.get(user=player1)
			except DashboardData.DoesNotExist:
				return Response({'message': f'[PUT] [{game.id}] Player 1: No Dashboard Data'}, status=status.HTTP_404_NOT_FOUND)

			if score1 > score2:
				dashboard.games_played += 1
				dashboard.prev_result = True
			else:
				dashboard.games_played += 1
				dashboard.prev_result = False
			dashboard.save()

			return Response({'message': f'[{id}]: Game Match Data Saved Successfully'}, status=status.HTTP_200_OK)
	
		return Response({'message': '[PUT] Invalid Game Match Request'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateOnlineGame(APIView):
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
				player1 = UserAccount.objects.get(id=game.player1.id)
			except UserAccount.DoesNotExist:
				return Response({'message': f'[PUT] [{game.id}] Unknown Player 1'}, status=status.HTTP_404_NOT_FOUND)
			try:
				player2 = UserAccount.objects.get(id=game.player2.id)
			except UserAccount.DoesNotExist:
				return Response({'message': f'[PUT] [{game.id}] Unknown Player 2'}, status=status.HTTP_404_NOT_FOUND)
			try:
				dashboard1 = DashboardData.objects.get(user=player1)
				dashboard2 = DashboardData.objects.get(user=player2)
			except DashboardData.DoesNotExist:
				return Response({'message': f'[PUT] [{game.id}] Player(s): No Dashboard Data'}, status=status.HTTP_404_NOT_FOUND)

			if score1 > score2:
				winner = dashboard1
				loser = dashboard2
			else:
				loser = dashboard1
				winner = dashboard2

			winner.games_played += 1
			winner.prev_result = True
			winner.save()

			loser.games_played += 1
			loser.prev_result = False
			loser.save()

			return Response({'message': f'[{id}]: Game Match Data Saved Successfully'}, status=status.HTTP_200_OK)
		return Response({'message': '[PUT] Invalid Game Match Request'}, status=status.HTTP_400_BAD_REQUEST)
	
class UserGameModeHistory(APIView):
	def get(self, request, id):
		try:
			user = UserAccount.objects.get(id=id)
		except user.DoesNotExist:
			return Response({'message': f'[GET] [{id}] Unknown User'}, status=status.HTTP_404_NOT_FOUND)
		
		history = GameMatch.objects.filter(Q(player1=user) | Q(player2=user))
		if not history.exists():
			return Response({'message': f'[GET] [{user.username}] No match history'}, status=status.HTTP_404_NOT_FOUND)
		
		local = history.filter(game_mode=0).count()
		AI = history.filter(game_mode=1).count()
		online = history.filter(game_mode=2).count()
		tournament = history.filter(game_mode=3).count()
		responseData = {
			'local': local,
			'AI': AI,
			'online': online,
			'tournament': tournament
		}
		return Response({'data': responseData}, status=status.HTTP_200_OK)

class MutualGameHistory(APIView):
	def get(self, request, id1, id2):
		try:
			player1 = UserAccount.objects.get(id=id1)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[GET] [{id1}] Unknown Player 1'}, status=status.HTTP_404_NOT_FOUND) 
		try:
			player2 = UserAccount.objects.get(id=id2)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[GET] [{id2}] Unknown Player 2'}, status=status.HTTP_404_NOT_FOUND) 
		history = GameMatch.objects.filter(Q(player1=player1) | Q(player2=player1) and Q(player1=player2) | Q(player2=player2))

		if not history:
			return Response({'message': f'[GET] [{player1.username} and {player2.username}] No mutual match history'}, status=status.HTTP_404_NOT_FOUND)
		serializer = GameMatchSerializer(history, many=True)
		return Response({'data': serializer.data}, status=status.HTTP_200_OK)