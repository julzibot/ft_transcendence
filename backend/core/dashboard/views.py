from .models import DashboardData
from users.models import UserAccount
from .serializers import DashboardSerializer
# REST framework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

# Create your views here.
class DashboardView(APIView):
	def get(self, request):
		dashboard = DashboardData.objects.all()
		serializer = DashboardSerializer(dashboard, many=True)
		return Response(serializer.data)
	
	def post(self, request):
		data = request.data
		user_id = data.get('user_id')
		try:
			user = UserAccount.objects.get(id=user_id)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[{id}] User not found'}, status=status.HTTP_404_NOT_FOUND)
		
		try:
			dashboard = DashboardData.objects.get(user=user_id)
			serializer = DashboardSerializer(dashboard, data=request.data, partial=True) 
			if serializer.is_valid():
				serializer.save()
				return Response({'message': f'[{id}] Dashboard Data saved successfully'}, status=status.HTTP_202_ACCEPTED)
			return Response({'message': f'{serializer.errors}'}, status=status.HTTP_400_BAD_REQUEST)
		except DashboardData.DoesNotExist:
			return Response({'message': f'[{id}] Dashboard Data not found'}, status=status.HTTP_404_NOT_FOUND)

class DashboardUserDetail(APIView):
	def get(self, request, id):
		try:
			user = UserAccount.objects.get(id=id)
		except UserAccount.DoesNotExist:
			return Response({'message': f'[{id}] User not found'}, status=status.HTTP_404_NOT_FOUND)
		try:
			dashboard_detail = DashboardData.objects.get(user=id)
		except:
			return Response({'message': f'[{id}] No Dashboard Data'}, status.HTTP_404_NOT_FOUND)
		serializer = DashboardSerializer(dashboard_detail)
		return Response(serializer.data)
		