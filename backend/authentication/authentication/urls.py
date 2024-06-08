from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
		path('dashboard/', include('dashboard.urls')),
    path('api/friends/', include('friends.urls')),
    path('api/game/', include('game.urls')),
    path('api/tournament/', include('tournament.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
