from django.contrib import admin
from .models import LobbyData

class LobbyAdmin(admin.ModelAdmin):
	list_display = ['name', 'player1', 'player2']

# Register your models here.
admin.site.register(LobbyData, LobbyAdmin)

