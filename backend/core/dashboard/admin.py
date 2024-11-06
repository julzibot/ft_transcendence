from django.contrib import admin
from .models import DashboardData

class DashboardAdmin(admin.ModelAdmin):
	fields = ['user', 'record_streak', 'tournaments_won', 'tournaments_played', 'games_played', 'wins']
	list_display = ['user', 'record_streak', 'tournaments_won', 'tournaments_played', 'games_played']
	readonly_fields = ['games_played', 'wins']

	def games_played(self, obj):
		return obj.games_played

	def wins(self, obj):
		return obj.wins
	
	def record_streak(self, obj):
		return obj.record_streak
	
	games_played.short_description = 'Games Played'
	wins.short_description = 'Wins'
	record_streak.short_description = 'Record Streak'

admin.site.register(DashboardData, DashboardAdmin)