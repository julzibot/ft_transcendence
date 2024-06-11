from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer, OpenApiResponse
from rest_framework import serializers



from .models import TournamentParticipants
from users.models import UserAccount
from .serializers import TournamentParticipantsSerializer
from rest_framework import status

# Create your views here.
class TournamentParticipantView(APIView):
	def get(self, request):
		tournamentParticipants = TournamentParticipants.objects.all()
		serializer = TournamentParticipantsSerializer(tournamentParticipants, many=True)
		return Response(serializer.data)

class CreateTournamentParticipantView(APIView):
  @extend_schema(
    request=inline_serializer(
        name="InlineFormSerializer",
        fields={
            "tournament_id": serializers.CharField(),
            "user_id": serializers.CharField(),
        },
    ),
    description="join tournament",
    responses={
       200: inline_serializer(
           name='JoinTournamentresponse',
           fields={
               'message': serializers.CharField(),
           }
       ), 
       400: OpenApiResponse(description='user not found'),
    }
)
  def post(self, request):
    data = request.data
    try:
      user = UserAccount.objects.get(id=data['user_id'])
    except ObjectDoesNotExist:
      return Response({'message': 'user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    new_participant = TournamentParticipants.objects.create(tournamentId = data['tournament_id'], user_id = user)
    return Response({'message':'You have joined tournament successfully'}, status=status.HTTP_201_CREATED)

class LeaveTournamentParticipantView(APIView):
  def delete(self, request, tournamentId, userId):
    try:
      tournamentParticipant = TournamentParticipants.objects.filter(user_id=userId, tournamentId = tournamentId)
    except ObjectDoesNotExist:
      return Response({'message': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)

    print("123------", tournamentParticipant)  
    if tournamentParticipant:
      tournamentParticipant.delete()
      return Response({'message':'You have left tournament successfully'}, status=status.HTTP_201_CREATED)
    else:
     return Response({'message': 'Record not found with this Ids'}, status=status.HTTP_404_NOT_FOUND)

