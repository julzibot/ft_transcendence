from django.contrib import admin
from .models import TournamentModel, ParticipantModel

# Register your models here.
admin.site.register(TournamentModel)
admin.site.register(ParticipantModel)

