from django.contrib import admin
from django.urls import path, include
from accounts.test_views import test_db_connection

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/projects/', include('projects.urls')),
    path('test-db/', test_db_connection, name='test-db'),
]