from django.urls import path
from .views import TournamentCreateView, TournamentListView, JoinTournamentView


urlpatterns = [
  path('create/', TournamentCreateView.as_view(), name='tournament-create'),
  path('', TournamentListView.as_view(), name='tournament-list'),
  path('join/', JoinTournamentView.as_view(), name='tournament-join'),
  # path('<int:id>', TournamentDetailView.as_view(), name='tournament-detail'),
]