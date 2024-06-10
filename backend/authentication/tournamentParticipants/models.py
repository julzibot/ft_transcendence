from django.db import models
from users.models import UserAccount

# Create your models here.
class TournamentParticipants(models.Model):
    id = models.BigAutoField(primary_key=True)
    tournamentId = models.CharField(max_length=60, unique=False)
    user_id = models.ForeignKey(UserAccount, related_name='user_id_tournament', on_delete=models.CASCADE)
    isEliminated = models.BooleanField(default=False)
