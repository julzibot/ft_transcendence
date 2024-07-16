from django.urls import path
from .views import DashboardView, DashboardDetail

urlpatterns = [
	path('', DashboardView.as_view(), name='update-dashboard'),
	path('<int:id>', DashboardDetail.as_view(), name='dashboard-detail'),
]