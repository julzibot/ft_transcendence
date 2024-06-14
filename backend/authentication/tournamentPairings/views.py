from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import TournamentPairingData
from users.models import UserAccount
from .serializers import TournamentPairingSerializer
from tournamentParticipants.models import TournamentParticipants
from tournamentParticipants.serializers import TournamentParticipantsSerializer
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist



import random

# Create your views here.
class CreateMatchMakingView(APIView):
	def pop_random(self, lst):
		idx = random.sample(lst, 1)
		return idx

	def get(self, request, id):
		data = request.data
		tournamentParticpant = TournamentParticipants.objects.filter(tournament_id=id, isEliminated = False)
		tournamentPairings = TournamentPairingData.objects.filter(tournament_id=id)
		serializerT = TournamentParticipantsSerializer(tournamentParticpant, many=True)
		serializerPairings = TournamentPairingSerializer(tournamentPairings, many=True)
		particpantsData = serializerT.data
		print("serializerPairings", serializerPairings.data)
		if(len(serializerPairings.data) > 0):
			return Response({'particpants': serializerPairings.data }, status=status.HTTP_201_CREATED)
		else:
			while len(particpantsData) != 0:
				rand1 = self.pop_random(particpantsData)
				particpantsData.remove(rand1[0])
				try:
					user = UserAccount.objects.get(id=rand1[0]['user_id'])
				except ObjectDoesNotExist:
					return Response({'message': 'user not found'}, status=status.HTTP_404_NOT_FOUND)
				
				rand2 = self.pop_random(particpantsData)
				particpantsData.remove(rand2[0])
				try:
					user2 = UserAccount.objects.get(id=rand2[0]['user_id'])
				except ObjectDoesNotExist:
					return Response({'message': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

				particpantPairing = TournamentPairingData.objects.create(tournament_id = id, player1 =user, player2 = user2, round_id = 1)
			tournamentPairingsNew = TournamentPairingData.objects.filter(tournament_id=id)
			serializerPairingsNew = TournamentPairingSerializer(tournamentPairings, many=True)
			return Response({'particpants': serializerPairingsNew.data }, status=status.HTTP_201_CREATED)



	

