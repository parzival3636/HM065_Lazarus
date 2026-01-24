"""
Portfolio API views for developer portfolio projects.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .supabase_client import get_supabase_client


@csrf_exempt
def get_developer_portfolio(request, developer_id):
    """Get all portfolio projects for a developer."""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        supabase = get_supabase_client()
        
        # Get all portfolio projects for the developer
        result = supabase.table('portfolio_projects').select('*').eq(
            'developer_id', developer_id
        ).order('featured', desc=True).order('created_at', desc=True).execute()
        
        projects = []
        for project in result.data:
            projects.append({
                'id': project.get('id'),
                'title': project.get('title'),
                'description': project.get('description'),
                'tech_stack': project.get('tech_stack', []),
                'images': project.get('images', []),
                'video_url': project.get('video_url'),
                'project_url': project.get('project_url'),
                'github_url': project.get('github_url'),
                'featured': project.get('featured', False),
                'views_count': project.get('views_count', 0),
                'created_at': project.get('created_at'),
            })
        
        return JsonResponse({'projects': projects})
    except Exception as e:
        print(f"Get portfolio error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def create_portfolio_project(request):
    """Create a new portfolio project."""
    print(f"Portfolio create called with method: {request.method}")
    
    if request.method == 'GET':
        return JsonResponse({'message': 'Portfolio create endpoint is working'})
    
    if request.method != 'POST':
        print(f"Method not allowed: {request.method}")
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
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
        
        # Use Supabase user ID (UUID)
        developer_id = user_response.user.id
        
        # Create portfolio project
        project_data = {
            'developer_id': developer_id,
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'tech_stack': data.get('tech_stack', []),
            'images': data.get('images', []),
            'video_url': data.get('video_url'),
            'project_url': data.get('project_url'),
            'github_url': data.get('github_url'),
            'featured': data.get('featured', False),
        }
        
        result = supabase.table('portfolio_projects').insert(project_data).execute()
        
        if result.data:
            return JsonResponse({
                'message': 'Portfolio project created successfully',
                'project': result.data[0]
            })
        else:
            return JsonResponse({'error': 'Failed to create project'}, status=500)
    
    except Exception as e:
        print(f"Create portfolio error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def update_portfolio_project(request, project_id):
    """Update a portfolio project."""
    if request.method != 'PUT':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
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
        project_result = supabase.table('portfolio_projects').select('developer_id').eq(
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
        
        result = supabase.table('portfolio_projects').update(update_data).eq(
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
def delete_portfolio_project(request, project_id):
    """Delete a portfolio project."""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
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
        project_result = supabase.table('portfolio_projects').select('developer_id').eq(
            'id', project_id
        ).execute()
        
        if not project_result.data or project_result.data[0]['developer_id'] != developer_id:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        
        # Delete project
        supabase.table('portfolio_projects').delete().eq('id', project_id).execute()
        
        return JsonResponse({'message': 'Portfolio project deleted successfully'})
    
    except Exception as e:
        print(f"Delete portfolio error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def increment_portfolio_views(request, project_id):
    """Increment view count for a portfolio project."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        supabase = get_supabase_client()
        
        # Get current view count
        result = supabase.table('portfolio_projects').select('views_count').eq(
            'id', project_id
        ).execute()
        
        if not result.data:
            return JsonResponse({'error': 'Project not found'}, status=404)
        
        current_views = result.data[0].get('views_count', 0)
        
        # Increment view count
        supabase.table('portfolio_projects').update({
            'views_count': current_views + 1
        }).eq('id', project_id).execute()
        
        return JsonResponse({'message': 'View count incremented'})
    
    except Exception as e:
        print(f"Increment views error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)