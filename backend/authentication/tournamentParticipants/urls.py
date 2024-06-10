from django.urls import path
from .views import TournamentParticipantView,CreateTournamentParticipantView, LeaveTournamentParticipantView


urlpatterns = [
  path('', TournamentParticipantView.as_view(), name='tournament'),
  path('joinTournament', CreateTournamentParticipantView.as_view(), name='Join-Tournamnet'),
  path('leaveTournament', LeaveTournamentParticipantView.as_view(), name='Leave-Tournament'),
]