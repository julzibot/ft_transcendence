from django.db import models
from users.models import UserAccount
from django.core.validators import MinValueValidator, MaxValueValidator
from uuid import uuid4

class TournamentResultsModel(models.Model):
    pass


class TournamentModel(models.Model):
    name = models.CharField(max_length=60, unique=False, blank=False, null=False)
    maxPlayerNumber = models.PositiveIntegerField(validators=[MinValueValidator(2), MaxValueValidator(8)], default=4)
    isFinished = models.BooleanField(default=False)
    isStarted = models.BooleanField(default=False)
    timer = models.PositiveIntegerField(validators=[MinValueValidator(5), MaxValueValidator(60)], default=10) #in minutes
    # results = models.OneToOneField('TournamentResultsModel', on_delete=models.CASCADE, null=True, related_name='winner_tournament')
    difficultyLevel = models.PositiveIntegerField(validators=[MinValueValidator(0), MaxValueValidator(6)], default=4) #TO DO: verify the range
    power_ups = models.BooleanField(default=False)
    pointsPerGame = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(21)], default=10)
    numberOfPlayers = models.PositiveIntegerField(default=0)
    creator = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="tournament_creator", null=False)
    linkToJoin = models.UUIDField(default=uuid4, editable=False)


class ParticipantModel(models.Model):
    tournament = models.ForeignKey(TournamentModel, on_delete=models.CASCADE, related_name='players')
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='tournaments')
    gamesPlayed = models.PositiveIntegerField(default=0)
    wins = models.PositiveIntegerField(default=0)


    





    