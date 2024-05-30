from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer

# Create your views here.
class ChatView(APIView):
	def get(self, request, slug):
		room = Room.objects.filter(slug=slug)
		serializer = RoomSerializer(room, many=True)
		return Response(serializer.data)
	
	# def post(self, request, slug):
	# 	print(slug)
	# 	print('REQUEST DATA:')
	# 	print(request.data)
	# 	serializer = MessageSerializer(data=request.data)
	# 	print(request.data)
	# 	if serializer.is_valid():
	# 		serializer.save()
	# 		print('Message received:', serializer)
	# 		return Response(serializer.data, status=status.HTTP_201_CREATED)
	# 	else:
	# 		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageView(APIView):
	def get(self, request, slug):
		room = get_object_or_404(Room, slug=slug)
		messages = Message.objects.filter(room=room)
		serializer = MessageSerializer(messages, many=True)
		return Response(serializer.data)
	
	def post(self, request, slug):
		print('POSTING')
		serializer = MessageSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		else:
			print('Validation errors:', serializer.errors)  # This will give you a clue on what went wrong
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
