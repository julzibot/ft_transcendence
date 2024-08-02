from django.contrib import admin
from .models import GameMatch

@admin.register(GameMatch)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'player1_id', 'player2_id', 'score1', 'score2', 'date')
    # list_filter = ('date_joined', 'last_login', 'is_active', 'is_staff', )
    #   search_fields = ('name', )