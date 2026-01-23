from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api_views import ProjectViewSet, ProjectApplicationViewSet
from .assignment_views import ProjectAssignmentViewSet

# Create router for REST API
router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')
router.register(r'applications', ProjectApplicationViewSet, basename='application')
router.register(r'assignments', ProjectAssignmentViewSet, basename='assignment')

urlpatterns = [
    # REST API routes
    path('', include(router.urls)),
    
    # Legacy routes (kept for backward compatibility)
    path('legacy/list/', views.project_list, name='project-list'),
    path('legacy/create/', views.project_create, name='project-create'),
    path('legacy/<int:pk>/', views.project_detail, name='project-detail'),
    path('legacy/<int:pk>/apply/', views.project_apply, name='project-apply'),
    path('legacy/<int:pk>/submissions/', views.project_submissions, name='project-submissions'),
]