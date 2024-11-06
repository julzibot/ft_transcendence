from django.contrib import admin
from .models import TournamentModel, ParticipantModel

class TournamentAdmin(admin.ModelAdmin):
    fields = ['name', 'maxPlayerNumber', 'numberOfPlayers', 'isFinished', 'isStarted', 'timer', 'difficultyLevel', 'power_ups', 'pointsPerGame', 'creator', 'linkToJoin']
    list_display = ['name', 'creator', 'pointsPerGame', 'maxPlayerNumber', 'timer', 'isFinished', 'isStarted']
    readonly_fields = ['linkToJoin', 'numberOfPlayers']
    
    def numberOfPlayers(self, obj):
        return obj.numberOfPlayers
    
    numberOfPlayers.short_description = 'Number of Players'

class ParticipantAdmin(admin.ModelAdmin):
    fields = ['user', 'tournament_name', 'gamesPlayed', 'wins']
    list_display = ['user', 'tournament_name', 'gamesPlayed', 'wins']
    readonly_fields = ['tournament_name']

    def tournament_name(self, obj):
        return obj.tournament.name

# Register your models here.
admin.site.register(TournamentModel, TournamentAdmin)
admin.site.register(ParticipantModel, ParticipantAdmin)


