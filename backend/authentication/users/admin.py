from django.contrib import admin
from .models import UserAccount

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
      list_display = ('id', 'login', 'nick_name', 'email', 'image', 'password', 'date_joined', 'last_login', 'is_active', 'is_staff', 'is_superuser')
      list_filter = ('date_joined', 'last_login', 'is_active', 'is_staff', )
      search_fields = ('name', )