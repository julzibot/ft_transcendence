from django.contrib import admin
from .models import Friendship

@admin.register(Friendship)
class FriendRequestAdmin(admin.ModelAdmin):
      list_display = ('id', 'user_id1', 'user_id2', "requestor", "status", "request_date", "updated_at")

