from django.urls import path
from .views import GameHistory, UserGameHistory, GameDataView, UpdateGameInfos

urlpatterns = [
    path('create', 							GameDataView.as_view()),
    path('update/<int:id>',				UpdateGameInfos.as_view()),
		path('history', 							GameHistory.as_view(), name='all-game-history'), # get all match history
		path('history/<int:id>',			GameHistory.as_view(), name='match-history'), # get specific match
		path('history/user/<int:id>',	UserGameHistory.as_view(), name='user-game-history'), # get user's match history
]

# get history of all matches
# get specific user's match history
# get individual match
# create match
# update match

# input: user1 and user2 => mutual matches ???