from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import request
import jwt, os, datetime

from .models import DashboardData
from .serializers import DashboardSerializer
# REST framework
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import (TokenRefreshView)

# Create your views here.
class DashboardView(APIView):
	def get(self, request):
		dashboard = DashboardData.objects.all()
		serializer = DashboardSerializer(dashboard, many=True)
		return Response(serializer.data)
	
	def post(self, request):
		data = DashboardSerializer(request)

class DashboardDetail(APIView):
	def get(self, request, *args, **kwargs):
		try:
			id = self.kwargs['id']
		except:
			return Response(status.HTTP_400_BAD_REQUEST)
		try:
			dashboard_detail = DashboardData.objects.get(user_id=id)
		except:
			return Response(status.HTTP_404_NOT_FOUND)
		serializer = DashboardSerializer(dashboard_detail)
		return Response(serializer.data)
		