from django.contrib import admin

# Register your models here.
from .models import DashboardData

class DashboardAdmin(admin.ModelAdmin):
	fields = ['user', 'games_played', 'wins', 'record_streak', 'tournaments_won', 'tournaments_played']
admin.site.register(DashboardData, DashboardAdmin)