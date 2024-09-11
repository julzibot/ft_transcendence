from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
		path('api/dashboard/', include('dashboard.urls')),
    path('api/friends/', include('friends.urls')),
    path('api/game/', include('game.urls')),
    path('api/lobby/', include('lobby.urls')),
    path('api/tournament/', include('tournament.urls')),
    path('api/tournamentParticipants/', include('tournamentParticipants.urls')),
    path('api/tournamentPairings/', include('tournamentPairings.urls')),
		path('api/gameCustomization/', include('gameCustomization.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
