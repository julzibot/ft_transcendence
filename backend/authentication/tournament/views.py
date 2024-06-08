from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TournamentData
from .serializers import TournamentSerializer

# Create your views here.
class TournamentView(APIView):
	def get(self, request):
		tournament = TournamentData.objects.all()
		serializer = TournamentSerializer(tournament, many=True)
		return Response(serializer.data)
