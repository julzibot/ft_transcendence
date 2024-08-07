from django.contrib import admin

# Register your models here.
from .models import DashboardData

class DashboardAdmin(admin.ModelAdmin):
	readonly_fields = ['games_played', 'wins']
	fields = ['user', 'record_streak', 'tournaments_won', 'tournaments_played']
admin.site.register(DashboardData, DashboardAdmin)