from django.contrib import admin
from .models import FriendRequest, FriendList

@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
      list_display = ('id', 'user_id1', 'user_id2', "requestor")

@admin.register(FriendList)
class FriendListAdmin(admin.ModelAdmin):
      list_display = ('user_id1', 'user_id2')
