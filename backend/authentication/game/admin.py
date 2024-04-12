from django.contrib import admin
from .models import Game

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'player1', 'score1', 'score2')
    # list_filter = ('date_joined', 'last_login', 'is_active', 'is_staff', )
    #   search_fields = ('name', )