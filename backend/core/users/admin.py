from django.contrib import admin
from .models import UserAccount

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
      list_display = ('id', 'username', 'email', 'image', 'password', 'date_joined', 'last_login', 'is_active', 'is_online', 'is_staff', 'is_superuser')
      list_filter = ('date_joined', 'last_login', 'is_active', 'is_online', 'is_staff', )
      search_fields = ('name', )