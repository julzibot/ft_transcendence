from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer, OpenApiResponse
from rest_framework import serializers

from .models import LobbyData
from .serializers import LobbySerializer
from rest_framework import status

import random

# Create your views here.
class LobbyView(APIView):
	def get(self, request):
		lobby = LobbyData.objects.filter(Q(lobbyWinner__isnull=True) | Q(lobbyWinner = None))
		serializer = LobbySerializer(lobby, many=True)
		return Response(serializer.data)

	@extend_schema(
    request=inline_serializer(
        name="InlineFormSerializer",
        fields={
            "name": serializers.CharField(),
            "numberOfPlayers": serializers.CharField(),
			"isPrivate": serializers.BooleanField(),
			"difficultyLevel": serializers.CharField(),
			"isActiveLobby": serializers.BooleanField(),
			"pointsPerGame": serializers.CharField(),
			"timer": serializers.CharField(),
			"gameName": serializers.CharField(),
        },
    ),
    description="create Lobby",
    responses={
       200: inline_serializer(
           name='CreateLobbyresponse',
           fields={
               'message': serializers.CharField(),
           }
       ), 
       400: OpenApiResponse(description='user not found'),
    }
	)	
	
	def post(self, request):
		data = request.data
		powerUpsData = []
		if 'powerUps' in data:
			powerUpsData = data["powerUps"]
		
		new_lobby = LobbyData.objects.create(name = data['name'], numberOfPlayers = data['numberOfPlayers'], isPrivate = data['isPrivate'],difficultyLevel = data['difficultyLevel'],isActiveLobby = data['isActiveLobby'],pointsPerGame = data['pointsPerGame'],timer = data['timer'], powerUps= powerUpsData, gameName = data['gameName'])
		return Response({'message':'You have created lobby successfully'}, status=status.HTTP_201_CREATED)	

	@extend_schema(
    request=inline_serializer(
        name="lobbyFormSerializer",
        fields={
            "lobby_id": serializers.CharField(),
            "isActiveLobby": serializers.BooleanField(),
        },
    ),
    description="update Lobby",
    responses={
       200: inline_serializer(
           name='UpdateLobbyresponse',
           fields={
               'message': serializers.CharField(),
           }
       ), 
       400: OpenApiResponse(description='lobby not found with this id'),
    }
	)
	def put(self,request):
		data = request.data

		lobbyData = LobbyData.objects.filter(id=data["lobby_id"])
		serializerLobby = LobbySerializer(lobbyData, many=True)

		if(len(serializerLobby.data) > 0):
			lobbyData.update(isActiveLobby=data["isActiveLobby"])
			return Response({'message': 'lobby data has been updated' }, status=status.HTTP_201_CREATED)
		else:
			return Response({'message': 'lobby not found with this id'}, status=status.HTTP_404_NOT_FOUND)





	

