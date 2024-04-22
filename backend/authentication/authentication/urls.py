from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
		path('dashboard/', include('dashboard.urls')),
    path('api/friends/', include('friends.urls')),
    path('api/game/', include('game.urls')),
    # path('chat/', include ('chat.urls'))
]
