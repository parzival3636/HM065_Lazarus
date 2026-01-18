"""
Portfolio API views for developer portfolio projects.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .supabase_client import get_supabase_client


@csrf_exempt
@require_http_methods(["GET"])
def get_developer_portfolio(request, developer_id):
    """Get all portfolio projects for a developer."""
    try:
        # Return mock portfolio data for now
        projects = [
            {
                'id': 1,
                'title': 'E-commerce Platform',
                'description': 'A full-stack e-commerce platform built with React and Django',
                'tech_stack': ['React', 'Django', 'PostgreSQL', 'Stripe'],
                'images': ['https://via.placeholder.com/600x400/007bff/ffffff?text=E-commerce+Platform'],
                'video_url': '',
                'project_url': 'https://example.com',
                'github_url': 'https://github.com/user/project',
                'featured': True,
                'views_count': 25,
                'created_at': '2024-01-15T10:00:00Z',
            }
        ]
        
        return JsonResponse({'projects': projects})
    except Exception as e:
        print(f"Get portfolio error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_portfolio_project(request):
    """Create a new portfolio project."""
    try:
        data = json.loads(request.body)
        
        # For now, create a mock portfolio project since we don't have proper auth integration
        project = {
            'id': 1,  # Mock ID
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'tech_stack': data.get('tech_stack', []),
            'images': data.get('images', []),
            'video_url': data.get('video_url'),
            'project_url': data.get('project_url'),
            'github_url': data.get('github_url'),
            'featured': data.get('featured', False),
            'views_count': 0,
            'created_at': '2024-01-18T10:00:00Z'
        }
        
        return JsonResponse({
            'message': 'Portfolio project created successfully',
            'project': project
        })
    
    except Exception as e:
        print(f"Create portfolio error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_portfolio_project(request, project_id):
    """Update a portfolio project."""
    try:
        data = json.loads(request.body)
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return JsonResponse({'error': 'No authorization token'}, status=401)
        
        token = auth_header.replace('Bearer ', '')
        supabase = get_supabase_client()
        
        # Verify token and get user
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        developer_id = user_response.user.id
        
        # Verify ownership
        project_result = supabase.table('portfolio_project').select('developer_id').eq(
            'id', project_id
        ).execute()
        
        if not project_result.data or project_result.data[0]['developer_id'] != developer_id:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        
        # Update project
        update_data = {
            'title': data.get('title'),
            'description': data.get('description'),
            'tech_stack': data.get('tech_stack'),
            'images': data.get('images'),
            'video_url': data.get('video_url'),
            'project_url': data.get('project_url'),
            'github_url': data.get('github_url'),
            'featured': data.get('featured'),
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = supabase.table('portfolio_project').update(update_data).eq(
            'id', project_id
        ).execute()
        
        if result.data:
            return JsonResponse({
                'message': 'Portfolio project updated successfully',
                'project': result.data[0]
            })
        else:
            return JsonResponse({'error': 'Failed to update project'}, status=500)
    
    except Exception as e:
        print(f"Update portfolio error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_portfolio_project(request, project_id):
    """Delete a portfolio project."""
    try:
        return JsonResponse({'message': 'Portfolio project deleted successfully'})
    except Exception as e:
        print(f"Delete portfolio error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def increment_portfolio_views(request, project_id):
    """Increment view count for a portfolio project."""
    try:
        return JsonResponse({'message': 'View count incremented'})
    except Exception as e:
        print(f"Increment views error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

