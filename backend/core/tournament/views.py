from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import AllowAny

from .models import TournamentModel, ParticipantModel
from users.models import UserAccount
from .serializers import TournamentSerializer, ParticipantSerializer
from rest_framework import status
import uuid

@method_decorator(csrf_exempt, name='dispatch') # TO DO: remove this line
class TournamentCreateView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		data = request.data.copy()
		try:
			creator = UserAccount.objects.get(id=data['creator'])
		except ObjectDoesNotExist:
			return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

		serializer = TournamentSerializer(data=data)
		if serializer.is_valid():
			validated_data = serializer.validated_data
			tournament = TournamentModel.objects.create(
				name=validated_data['name'],
				maxPlayerNumber=validated_data['maxPlayerNumber'],
				timer=validated_data['timer'],
				power_ups=validated_data['power_ups'],
				difficultyLevel=validated_data['difficultyLevel'],
				pointsPerGame=validated_data['pointsPerGame'],
				creator=creator,
			)
			return Response({
					'message': 'You have created tournament successfully',
			}, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class TournamentListView(APIView):
	permission_classes = [AllowAny]
	def get(self, request):
		tournaments = TournamentModel.objects.filter(isFinished=False).all()
		serializer = TournamentSerializer(tournaments, many=True)
		return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class JoinTournamentView(APIView):
	permission_classes = [AllowAny]
	def post(self, request):
		tournament_id = request.data.get('tournament_id')
		try:
			user = UserAccount.objects.get(id=request.data.get('user_id'))
			tournament = TournamentModel.objects.get(id=tournament_id)
		except ObjectDoesNotExist:
			return Response({'message': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
		if tournament.numberOfPlayers + 1 > tournament.maxPlayerNumber:
			return Response({'message': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)
		ParticipantModel.objects.get_or_create(tournament=tournament, user=user)
		return Response({'message': 'You have joined the tournament'}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class TournamentView(APIView):
	permission_classes = [AllowAny]
	def get(self, request, id):
		try:
			uuid.UUID(id, version=4)
		except ValueError:
			return Response({'message': 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			tournament = TournamentModel.objects.get(linkToJoin=id)
		except ObjectDoesNotExist:
			return Response({'message': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
		tournamentSerializer = TournamentSerializer(tournament)
		participants = ParticipantModel.objects.filter(tournament=tournament).all()
		participantSerializer = ParticipantSerializer(participants, many=True)
		return Response({'participants': participantSerializer.data, 'tournament': tournamentSerializer.data}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class DeleteParticipantView(APIView):
	permission_classes = [AllowAny]
	def delete(self, request, id):
		try:
			uuid.UUID(id, version=4)
		except ValueError:
			return Response({'message': 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			tournament = TournamentModel.objects.get(linkToJoin=id)
			user = UserAccount.objects.get(id=request.data['userId'])
			participant = ParticipantModel.objects.get(user=user, tournament=tournament)
		except ObjectDoesNotExist:
			return Response({'message': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)
		participant.delete()
		return Response({'message': 'Participant deleted'}, status=status.HTTP_204_NO_CONTENT)
