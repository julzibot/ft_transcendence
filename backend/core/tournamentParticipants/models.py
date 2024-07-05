from django.db import models
from users.models import UserAccount

# Create your models here.
class TournamentParticipants(models.Model):
    id = models.BigAutoField(primary_key=True)
    tournament_id = models.CharField(max_length=60, unique=False)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, null=True)
    isEliminated = models.BooleanField(default=False)
