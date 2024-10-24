from django.urls import path
from .views import LobbyView,  JoinLobbyView, LobbyDataView


urlpatterns = [
  path('', LobbyView.as_view(), name='lobby'),
  path('join/', JoinLobbyView.as_view(), name='join-lobby'),
	path('<str:linkToJoin>/', LobbyDataView.as_view(), name='lobby-data'),
]