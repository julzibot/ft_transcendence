from django.urls import path
from .views import TournamentView, TournamentDetailView, CreateMatchMakingView


urlpatterns = [
  path('', TournamentView.as_view(), name='tournament'),
  path('<int:id>', TournamentDetailView.as_view(), name='tournament-detail'),
  path('createMatchMaking/<int:id>', CreateMatchMakingView.as_view(), name='create-matchMaking'),
]