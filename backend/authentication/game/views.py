from .models import Game
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response


class   GameDataView(APIView):

    def post(self, request):
        data = request.data
        game = Game.objects.get(id)
        print(data)

        return Response(status=status.HTTP_200_OK)

    def put(self, request):
        id = request.data['id']
        game = Game.objects.get(id=id)
        
    # def get(self, request):


