from django.urls import path
from .views import GameHistory, UserGameHistory, GameDataView, UpdateLocalGame, UpdateOnlineGame, UserGameModeHistory, MutualGameHistory

urlpatterns = [
    path('create', 									GameDataView.as_view()),
    path('online/update/<int:id>',					UpdateOnlineGame.as_view(), name='update-online-game'),
		path('local/update/<int:id>',				UpdateLocalGame.as_view(), name='update-local-game'),
		path('history', 							GameHistory.as_view(), name='all-game-history'), # get all match history
		path('history/<int:id>',					GameHistory.as_view(), name='match-history'), # get specific match
		path('history/user/<int:id>',				UserGameHistory.as_view(), name='user-game-history'), # get user's match history
		path('history/user/<int:id>/game-modes',	UserGameModeHistory.as_view(), name='user-game-modes-history'),
		path('history/user/<int:id1>/<int:id2>',	MutualGameHistory.as_view(), name='mutual-game-history'),
]

# get history of all matches
# get specific user's match history
# get individual match
# create match
# update match

# input: user1 and user2 => mutual matches ???