from django.urls import path
from .views import DashboardView, DashboardUserDetail

urlpatterns = [
	path('', DashboardView.as_view(), name='update-dashboard'),
	path('<int:id>', DashboardUserDetail.as_view(), name='dashboard-detail'),
]