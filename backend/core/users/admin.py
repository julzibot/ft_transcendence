from django.contrib import admin
from .models import UserAccount

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
      list_display = ('id', 'username', 'image', 'password', 'date_joined', 'last_login', 'is_active', 'is_online', 'is_staff', 'is_superuser')
      list_filter = ('date_joined', 'last_login', 'is_active', 'is_online', 'is_staff', )
      search_fields = ('name', )

      def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
          obj.set_password(obj.password)
        else:
          obj.set_password(obj.password)
        super().save_model(request, obj, form, change)