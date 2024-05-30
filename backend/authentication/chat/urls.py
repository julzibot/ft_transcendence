from django.urls import path
from .views import ChatView, MessageView

urlpatterns = [
	path('<slug:slug>/', ChatView.as_view(), name='chatroom'),
	path('<slug:slug>/messages', MessageView.as_view(), name='messages'),
]