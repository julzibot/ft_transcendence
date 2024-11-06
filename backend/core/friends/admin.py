from django.contrib import admin
from .models import Friendship

@admin.register(Friendship)
class FriendRequestAdmin(admin.ModelAdmin):
      list_display = ('id', 'user1', 'user2', "requestor", "status", "request_date", "updated_at")

