from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api_views import ProjectViewSet, ProjectApplicationViewSet
from .assignment_views import ProjectAssignmentViewSet
from .team_assignment_views import TeamAssignmentViewSet
from . import figma_views
from . import feedback_views
from . import chatbot_views
from . import rejection_notifications

# Create router for REST API
router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')
router.register(r'applications', ProjectApplicationViewSet, basename='application')
router.register(r'assignments', ProjectAssignmentViewSet, basename='assignment')
router.register(r'team-assignments', TeamAssignmentViewSet, basename='team-assignment')

urlpatterns = [
    # REST API routes
    path('', include(router.urls)),
    
    # Figma verification workflow
    path('<str:project_id>/figma/shortlist/', figma_views.shortlist_top_three, name='figma-shortlist'),
    path('<str:project_id>/figma/get-shortlist/', figma_views.get_figma_shortlist, name='get-figma-shortlist'),
    path('<str:project_id>/figma/evaluate/', figma_views.evaluate_figma_submissions, name='evaluate-figma'),
    path('<str:project_id>/figma/assign/', figma_views.assign_after_figma, name='assign-after-figma'),
    path('figma/shortlist/<int:shortlist_id>/submit/', figma_views.submit_figma_design, name='submit-figma'),
    path('figma/my-shortlists/', figma_views.my_figma_shortlists, name='my-figma-shortlists'),
    path('figma/upload-image/', figma_views.upload_design_image, name='upload-design-image'),
    
    # Feedback and Rating endpoints
    path('feedback/submit/', feedback_views.submit_feedback, name='submit-feedback'),
    path('feedback/team/submit/', feedback_views.submit_team_feedback, name='submit-team-feedback'),
    path('feedback/developer/<str:developer_email>/', feedback_views.get_developer_feedback, name='get-developer-feedback'),
    path('feedback/unread/<str:developer_email>/', feedback_views.get_unread_feedback, name='get-unread-feedback'),
    path('feedback/<int:feedback_id>/mark-read/', feedback_views.mark_feedback_read, name='mark-feedback-read'),
    path('feedback/rating-summary/<str:developer_email>/', feedback_views.get_developer_rating_summary, name='developer-rating-summary'),
    
    # Chatbot endpoints
    path('chatbot/query/', chatbot_views.chatbot_query, name='chatbot-query'),
    path('chatbot/suggestions/', chatbot_views.chatbot_suggestions, name='chatbot-suggestions'),
    
    # Rejection Notification endpoints
    path('rejections/send/', rejection_notifications.send_rejection_notifications, name='send-rejections'),
    path('rejections/developer/<str:developer_email>/', rejection_notifications.get_rejection_notifications, name='get-rejections'),
    path('rejections/unread/<str:developer_email>/', rejection_notifications.get_unread_rejections, name='get-unread-rejections'),
    path('rejections/<int:notification_id>/mark-read/', rejection_notifications.mark_rejection_read, name='mark-rejection-read'),
    path('rejections/mark-all-read/<str:developer_email>/', rejection_notifications.mark_all_rejections_read, name='mark-all-rejections-read'),
    
    # Legacy routes (kept for backward compatibility)
    path('legacy/list/', views.project_list, name='project-list'),
    path('legacy/create/', views.project_create, name='project-create'),
    path('legacy/<int:pk>/', views.project_detail, name='project-detail'),
    path('legacy/<int:pk>/apply/', views.project_apply, name='project-apply'),
    path('legacy/<int:pk>/submissions/', views.project_submissions, name='project-submissions'),
]