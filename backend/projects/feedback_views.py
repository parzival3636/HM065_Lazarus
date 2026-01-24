from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Project, ProjectSubmission, SubmissionFeedback, ProjectAssignment
from accounts.supabase_service import SupabaseService
import json
from django.db.models import Avg, Count, Q
from django.db import models


@csrf_exempt
@require_http_methods(["POST"])
def submit_feedback(request):
    """Company submits feedback and rating for a developer after project completion"""
    try:
        data = json.loads(request.body)
        
        # Get company user from Supabase
        supabase = SupabaseService()
        company_email = data.get('company_email')
        company_user = supabase.get_user_by_email(company_email)
        
        if not company_user:
            return JsonResponse({'error': 'Company not found'}, status=404)
        
        # Get submission
        submission_id = data.get('submission_id')
        try:
            submission = ProjectSubmission.objects.get(id=submission_id)
        except ProjectSubmission.DoesNotExist:
            return JsonResponse({'error': 'Submission not found'}, status=404)
        
        # Check if feedback already exists
        existing_feedback = SubmissionFeedback.objects.filter(
            submission=submission,
            developer=submission.developer
        ).first()
        
        if existing_feedback:
            return JsonResponse({'error': 'Feedback already submitted for this developer'}, status=400)
        
        # Create feedback
        feedback = SubmissionFeedback.objects.create(
            project=submission.assignment.project,
            submission=submission,
            developer=submission.developer,
            company=submission.assignment.project.company,
            rating=data.get('rating'),
            feedback_text=data.get('feedback_text'),
            communication_rating=data.get('communication_rating'),
            quality_rating=data.get('quality_rating'),
            timeliness_rating=data.get('timeliness_rating'),
            professionalism_rating=data.get('professionalism_rating')
        )
        
        # Update developer's average rating in Supabase
        update_developer_rating(submission.developer.email)
        
        return JsonResponse({
            'success': True,
            'message': 'Feedback submitted successfully',
            'feedback_id': feedback.id
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def submit_team_feedback(request):
    """Company submits feedback for all team members"""
    try:
        data = json.loads(request.body)
        
        # Get company user
        supabase = SupabaseService()
        company_email = data.get('company_email')
        company_user = supabase.get_user_by_email(company_email)
        
        if not company_user:
            return JsonResponse({'error': 'Company not found'}, status=404)
        
        project_id = data.get('project_id')
        team_feedbacks = data.get('team_feedbacks', [])  # Array of feedback objects
        
        created_feedbacks = []
        
        for feedback_data in team_feedbacks:
            developer_email = feedback_data.get('developer_email')
            
            # Get developer's submission
            try:
                assignment = ProjectAssignment.objects.get(
                    project_id=project_id,
                    developer__email=developer_email
                )
                submission = assignment.submission
            except (ProjectAssignment.DoesNotExist, ProjectSubmission.DoesNotExist):
                continue
            
            # Check if feedback already exists
            existing = SubmissionFeedback.objects.filter(
                submission=submission,
                developer=assignment.developer
            ).first()
            
            if existing:
                continue
            
            # Create feedback
            feedback = SubmissionFeedback.objects.create(
                project_id=project_id,
                submission=submission,
                developer=assignment.developer,
                company=assignment.project.company,
                rating=feedback_data.get('rating'),
                feedback_text=feedback_data.get('feedback_text'),
                communication_rating=feedback_data.get('communication_rating'),
                quality_rating=feedback_data.get('quality_rating'),
                timeliness_rating=feedback_data.get('timeliness_rating'),
                professionalism_rating=feedback_data.get('professionalism_rating')
            )
            
            created_feedbacks.append(feedback.id)
            
            # Update developer rating
            update_developer_rating(developer_email)
        
        return JsonResponse({
            'success': True,
            'message': f'Feedback submitted for {len(created_feedbacks)} team members',
            'feedback_ids': created_feedbacks
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_developer_feedback(request, developer_email):
    """Get all feedback for a specific developer"""
    try:
        supabase = SupabaseService()
        developer = supabase.get_user_by_email(developer_email)
        
        if not developer:
            return JsonResponse({'error': 'Developer not found'}, status=404)
        
        # Get all feedback for this developer
        feedbacks = SubmissionFeedback.objects.filter(
            developer__email=developer_email
        ).select_related('project', 'company')
        
        feedback_list = []
        for feedback in feedbacks:
            feedback_list.append({
                'id': feedback.id,
                'project_title': feedback.project.title,
                'company_name': feedback.company.email,
                'rating': feedback.rating,
                'feedback_text': feedback.feedback_text,
                'communication_rating': feedback.communication_rating,
                'quality_rating': feedback.quality_rating,
                'timeliness_rating': feedback.timeliness_rating,
                'professionalism_rating': feedback.professionalism_rating,
                'is_read': feedback.is_read,
                'created_at': feedback.created_at.isoformat()
            })
        
        # Calculate average ratings
        avg_ratings = SubmissionFeedback.objects.filter(
            developer__email=developer_email
        ).aggregate(
            avg_rating=Avg('rating'),
            avg_communication=Avg('communication_rating'),
            avg_quality=Avg('quality_rating'),
            avg_timeliness=Avg('timeliness_rating'),
            avg_professionalism=Avg('professionalism_rating'),
            total_reviews=Count('id')
        )
        
        return JsonResponse({
            'feedbacks': feedback_list,
            'average_ratings': {
                'overall': round(avg_ratings['avg_rating'] or 0, 2),
                'communication': round(avg_ratings['avg_communication'] or 0, 2),
                'quality': round(avg_ratings['avg_quality'] or 0, 2),
                'timeliness': round(avg_ratings['avg_timeliness'] or 0, 2),
                'professionalism': round(avg_ratings['avg_professionalism'] or 0, 2),
                'total_reviews': avg_ratings['total_reviews']
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_unread_feedback(request, developer_email):
    """Get unread feedback notifications for a developer"""
    try:
        feedbacks = SubmissionFeedback.objects.filter(
            developer__email=developer_email,
            is_read=False
        ).select_related('project', 'company').order_by('-created_at')
        
        feedback_list = []
        for feedback in feedbacks:
            feedback_list.append({
                'id': feedback.id,
                'project_title': feedback.project.title,
                'company_name': feedback.company.email,
                'rating': feedback.rating,
                'feedback_text': feedback.feedback_text[:100] + '...' if len(feedback.feedback_text) > 100 else feedback.feedback_text,
                'created_at': feedback.created_at.isoformat()
            })
        
        return JsonResponse({
            'unread_count': len(feedback_list),
            'feedbacks': feedback_list
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def mark_feedback_read(request, feedback_id):
    """Mark feedback as read"""
    try:
        feedback = SubmissionFeedback.objects.get(id=feedback_id)
        feedback.is_read = True
        feedback.save()
        
        return JsonResponse({'success': True, 'message': 'Feedback marked as read'})
        
    except SubmissionFeedback.DoesNotExist:
        return JsonResponse({'error': 'Feedback not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_developer_rating_summary(request, developer_email):
    """Get developer's rating summary for profile display"""
    try:
        supabase = SupabaseService()
        developer = supabase.get_user_by_email(developer_email)
        
        if not developer:
            return JsonResponse({'error': 'Developer not found'}, status=404)
        
        # Get rating statistics
        stats = SubmissionFeedback.objects.filter(
            developer__email=developer_email
        ).aggregate(
            avg_rating=Avg('rating'),
            total_reviews=Count('id'),
            five_star=Count('id', filter=models.Q(rating=5)),
            four_star=Count('id', filter=models.Q(rating=4)),
            three_star=Count('id', filter=models.Q(rating=3)),
            two_star=Count('id', filter=models.Q(rating=2)),
            one_star=Count('id', filter=models.Q(rating=1))
        )
        
        return JsonResponse({
            'average_rating': round(stats['avg_rating'] or 0, 2),
            'total_reviews': stats['total_reviews'],
            'rating_distribution': {
                '5': stats['five_star'],
                '4': stats['four_star'],
                '3': stats['three_star'],
                '2': stats['two_star'],
                '1': stats['one_star']
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def update_developer_rating(developer_email):
    """Update developer's average rating in Supabase"""
    try:
        avg_rating = SubmissionFeedback.objects.filter(
            developer__email=developer_email
        ).aggregate(avg_rating=Avg('rating'))['avg_rating']
        
        total_reviews = SubmissionFeedback.objects.filter(
            developer__email=developer_email
        ).count()
        
        if avg_rating:
            supabase = SupabaseService()
            supabase.update_developer_rating(
                developer_email,
                round(avg_rating, 2),
                total_reviews
            )
    except Exception as e:
        print(f"Error updating developer rating: {e}")
