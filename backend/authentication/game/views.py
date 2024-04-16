from .models import Game
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response


class   GameDataView(APIView):
    def post(self, request):
        # data = request.data
        # game = Game.objects.get(id)
        # print(f"HERE'S THE DATA: {data}")
        new_game = Game.objects.create(player1_id = request.data['player1_id'])
        return Response({'id': new_game.id}, status=status.HTTP_201_CREATED)

class UpdateGameInfos(APIView):
    def put(self, request):
        id = request.data['id']
        instance = Game.objects.get(id=id)
        # instance = get_object_or_404(YourModel, pk=pk)
        instance.score1 = request.data['score1']
        instance.score2 = request.data['score2']
        instance.save()

        return Response({'message': 'scoring put in db'}, status=status.HTTP_200_OK)
        
    # def get(self, request):


