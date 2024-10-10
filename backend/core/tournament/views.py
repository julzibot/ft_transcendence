from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny

from .models import TournamentModel, ParticipantModel
from users.models import UserAccount
from .serializers import TournamentSerializer
from rest_framework import status

# Create your views here.
# class TournamentView(APIView):
# 	def get(self, request):
# 		tournament = TournamentData.objects.filter(Q(tournamentWinner__isnull=True) | Q(tournamentWinner = None))
# 		serializer = TournamentSerializer(tournament, many=True)
# 		return Response(serializer.data)

# 	@extend_schema(
#     request=inline_serializer(
#         name="InlineFormSerializer",
#         fields={
#             "name": serializers.CharField(),
#             "numberOfPlayers": serializers.CharField(),
# 			"isPrivate": serializers.BooleanField(),
# 			"difficultyLevel": serializers.CharField(),
# 			"isActiveTournament": serializers.BooleanField(),
# 			"pointsPerGame": serializers.CharField(),
# 			"timer": serializers.CharField(),
# 			"power_ups": serializers.BooleanField(),
#         },
#     ),
#     description="create tournament",
#     responses={
#        200: inline_serializer(
#            name='CreateTournamentresponse',
#            fields={
#                'message': serializers.CharField(),
#            }
#        ), 
#        400: OpenApiResponse(description='user not found'),
#     }
# 	)	
	
# 	def post(self, request):
# 		data = request.data
# 		if 'power_ups' in data:
# 			power_upsData = data["power_ups"]
# 		else:
# 			power_upsData=False
		
# 		print(data)
# 		new_tournament = TournamentData.objects.create(
# 			name=data['name'], 
# 			numberOfPlayers=data['numberOfPlayers'], 
# 			isPrivate=data['isPrivate'],
# 			difficultyLevel=data['difficultyLevel'],
# 			isActiveTournament=data['isActiveTournament'],
# 			pointsPerGame=data['pointsPerGame'],
# 			timer=data['timer'], 
# 			power_ups=power_upsData
# 		)

# 		return Response({'message':'You have created tournament successfully'}, status=status.HTTP_201_CREATED)	


# class TournamentDetailView(APIView):
# 	def get(self, request, id):
# 		tournament = TournamentData.objects.filter(id=id)
# 		tournamentParticpant = TournamentParticipants.objects.filter(tournament_id=id)
# 		serializer = TournamentSerializer(tournament, many=True)
# 		serializerT = TournamentParticipantsSerializer(tournamentParticpant, many=True)
# 		if(len(serializer.data) != 0):
# 			return Response({'data': {'detail': serializer.data, 'particpants': serializerT.data }}, status=status.HTTP_201_CREATED)	
# 		else:
# 			return Response({'message': 'Record not found with this Id.'}, status=status.HTTP_404_NOT_FOUND)


# class TournamentGetView(APIView):
# 	def get(self, request):
# 		query = Q(tournamentWinner__isnull=True)
# 		query.add(Q(tournamentWinner = None), Q.OR)
# 		tournament = TournamentData.objects.filter(query)
# 		serializer = TournamentSerializer(tournament, many=True)
# 		return Response({'data': {'tournaments': serializer.data}}, status=status.HTTP_201_CREATED)	



@method_decorator(csrf_exempt, name='dispatch')
class TournamentCreateView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = TournamentSerializer(data=request.data)
		if serializer.is_valid():
				tournament = serializer.save()
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
		return Response({'data': serializer.data}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class JoinTournamentView(APIView):
	permission_classes = [AllowAny]
	def post(self, request):
		tournament_id = request.data.get('tournament_id')
		user = UserAccount.objects.get(id=request.data.get('user_id'))
		try:
			tournament = TournamentModel.objects.get(id=tournament_id)
		except TournamentModel.DoesNotExist:
			return Response({'message': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
		if tournament.numberOfPlayers + 1 > tournament.maxPlayerNumber:
			return Response({'message': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)
		tournament.numberOfPlayers += 1
		tournament.save()
		participant = ParticipantModel.objects.create(tournament=tournament, user=user)
		return Response({'message': 'You have joined the tournament'}, status=status.HTTP_200_OK)
