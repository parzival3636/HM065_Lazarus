from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Project, ProjectApplication, ProjectAssignment
from accounts.supabase_service import SupabaseService
import json
from datetime import datetime


# Encouraging rejection messages
REJECTION_MESSAGES = [
    {
        "title": "Thank you for your application",
        "message": """Dear {developer_name},

Thank you for taking the time to apply for the "{project_title}" project. We truly appreciate your interest and the effort you put into your application.

After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with the specific requirements of this project.

Please don't feel discouraged! Your skills and experience are valuable, and we encourage you to continue applying for other projects on DevConnect. Every application is a learning opportunity, and the right project for you is out there.

We wish you the best of luck in your future endeavors and hope to see you succeed on our platform.

Best regards,
The DevConnect Team"""
    },
    {
        "title": "Update on your application",
        "message": """Hi {developer_name},

We wanted to reach out regarding your application for "{project_title}".

While we were impressed by your profile and experience, we've decided to proceed with candidates who have more specific expertise in the technologies required for this particular project.

This decision doesn't reflect on your abilities as a developer. The competition was strong, and we had to make difficult choices based on very specific project requirements.

Keep building your portfolio, continue applying, and stay positive! Your perfect project match is waiting for you on DevConnect.

Stay motivated and keep coding!

Warm regards,
DevConnect Team"""
    },
    {
        "title": "Application status update",
        "message": """Hello {developer_name},

Thank you for your interest in the "{project_title}" project.

After reviewing all applications, we've chosen to work with other developers for this specific project. This was a challenging decision given the quality of applications we received.

Remember: rejection is redirection! This simply means there's a better opportunity waiting for you. Use this as motivation to:
- Continue enhancing your skills
- Build more impressive portfolio projects
- Apply to projects that align even better with your expertise

Your talent and dedication will lead you to the right project. Don't give up!

Best wishes,
The DevConnect Team"""
    }
]


@csrf_exempt
@require_http_methods(["POST"])
def send_rejection_notifications(request):
    """
    Automatically send rejection notifications to non-selected applicants
    when a company assigns a project to developer(s)
    """
    try:
        data = json.loads(request.body)
        project_id = data.get('project_id')
        selected_developer_ids = data.get('selected_developer_ids', [])  # List of selected developer IDs
        
        if not project_id:
            return JsonResponse({'error': 'Project ID is required'}, status=400)
        
        # Get project
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found'}, status=404)
        
        # Get all applications for this project
        all_applications = ProjectApplication.objects.filter(project=project)
        
        # Filter rejected applications (those not selected)
        rejected_applications = all_applications.exclude(
            developer_id__in=selected_developer_ids
        ).exclude(
            status='rejected'  # Don't send duplicate rejections
        )
        
        notifications_sent = []
        supabase = SupabaseService()
        
        # Send rejection notification to each rejected applicant
        for application in rejected_applications:
            # Update application status
            application.status = 'rejected'
            application.save()
            
            # Get developer info
            developer = supabase.get_user_by_email(application.developer.email)
            developer_name = developer.get('name', 'Developer') if developer else 'Developer'
            
            # Select a random encouraging message
            import random
            message_template = random.choice(REJECTION_MESSAGES)
            
            # Format message with developer and project details
            formatted_message = message_template['message'].format(
                developer_name=developer_name,
                project_title=project.title
            )
            
            # Create notification record
            notification = RejectionNotification.objects.create(
                project=project,
                application=application,
                developer=application.developer,
                title=message_template['title'],
                message=formatted_message,
                sent_at=datetime.now()
            )
            
            notifications_sent.append({
                'developer_email': application.developer.email,
                'notification_id': notification.id
            })
        
        return JsonResponse({
            'success': True,
            'message': f'Rejection notifications sent to {len(notifications_sent)} applicants',
            'notifications': notifications_sent
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_rejection_notifications(request, developer_email):
    """Get all rejection notifications for a developer"""
    try:
        notifications = RejectionNotification.objects.filter(
            developer__email=developer_email
        ).select_related('project').order_by('-sent_at')
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                'id': notif.id,
                'project_title': notif.project.title,
                'title': notif.title,
                'message': notif.message,
                'is_read': notif.is_read,
                'sent_at': notif.sent_at.isoformat()
            })
        
        return JsonResponse({
            'notifications': notification_list,
            'unread_count': notifications.filter(is_read=False).count()
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_unread_rejections(request, developer_email):
    """Get unread rejection notifications"""
    try:
        notifications = RejectionNotification.objects.filter(
            developer__email=developer_email,
            is_read=False
        ).select_related('project').order_by('-sent_at')
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                'id': notif.id,
                'project_title': notif.project.title,
                'title': notif.title,
                'message': notif.message[:150] + '...' if len(notif.message) > 150 else notif.message,
                'sent_at': notif.sent_at.isoformat()
            })
        
        return JsonResponse({
            'unread_count': len(notification_list),
            'notifications': notification_list
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def mark_rejection_read(request, notification_id):
    """Mark rejection notification as read"""
    try:
        notification = RejectionNotification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Notification marked as read'
        })
        
    except RejectionNotification.DoesNotExist:
        return JsonResponse({'error': 'Notification not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def mark_all_rejections_read(request, developer_email):
    """Mark all rejection notifications as read for a developer"""
    try:
        updated = RejectionNotification.objects.filter(
            developer__email=developer_email,
            is_read=False
        ).update(is_read=True)
        
        return JsonResponse({
            'success': True,
            'message': f'Marked {updated} notifications as read'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Import the model at the end to avoid circular imports
from .models import RejectionNotification
