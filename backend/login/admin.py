from django.contrib import admin
from .models import Login

# Register your models here.
@admin.register(Login)
class LoginAdmin(admin.ModelAdmin):
  
  list_display = ('id', 'username', 'login_date', 'is_logged')
  list_filter = ('login_date', 'is_logged')
  search_fields = ('username', )