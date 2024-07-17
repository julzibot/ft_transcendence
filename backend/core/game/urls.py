from django.urls import path
from .views import GameHistory, UserGameHistory, GameDataView, UpdateGameInfos

urlpatterns = [
		path('history/', GameHistory.as_view()), # get all match history
		path('history/<int:id>/', GameHistory.as_view()), # get specific match
		path('user/<int:id>/', UserGameHistory.as_view(), name='user-game-history'), # get user's match history
    path('create/', GameDataView.as_view()),
    path('update/', UpdateGameInfos.as_view()),
]

# get all match history
# get specific user's match history
# get individual match
# create match
# update match

# input: user1 and user2 => mutual matches ???