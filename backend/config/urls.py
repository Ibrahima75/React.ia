from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.chat.urls')),
    path('api/', include('apps.models_config.urls')),
    path('api/', include('apps.monitoring.urls')),
    path('api/', include('apps.preferences.urls')),
    path('api/', include('apps.upload.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
