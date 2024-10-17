from django.contrib import admin
from .models import TournamentModel, ParticipantModel

class TournamentAdmin(admin.ModelAdmin):
    fields = ['name']
    list_display = ['name']

class ParticipantAdmin(admin.ModelAdmin):
    fields = ['user', 'tournament_name']
    list_display = ['user', 'tournament_name']
    readonly_fields = ['tournament_name']

    def tournament_name(self, obj):
        return obj.tournament.name

# Register your models here.
admin.site.register(TournamentModel, TournamentAdmin)
admin.site.register(ParticipantModel, ParticipantAdmin)


