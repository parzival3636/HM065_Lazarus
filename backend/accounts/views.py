from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .supabase_client import get_supabase_client

@csrf_exempt
def register_developer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            supabase = get_supabase_client()
            
            # Use Supabase Auth to create user
            auth_response = supabase.auth.sign_up({
                "email": data['email'],
                "password": data['password'],
                "options": {
                    "data": {
                        "first_name": data['firstName'],
                        "last_name": data['lastName'],
                        "user_type": "developer",
                        "phone": data.get('phone', ''),
                        "country": data['country'],
                        "city": data.get('city', '')
                    }
                }
            })
            
            if auth_response.user:
                user_id = auth_response.user.id
                
                # Create developer profile in Supabase
                developer_profile_data = {
                    'user_id': user_id,
                    'title': data.get('title', 'Developer'),
                    'bio': data.get('bio', ''),
                    'hourly_rate': float(data.get('hourlyRate', 25)) if data.get('hourlyRate') else 25.00,
                    'skills': data.get('skills', 'JavaScript,HTML,CSS'),
                    'experience': data.get('experience', 'entry'),
                    'years_experience': int(data.get('yearsExperience', 0)) if data.get('yearsExperience') else 0,
                    'portfolio': data.get('portfolio', ''),
                    'github': data.get('github', ''),
                    'linkedin': data.get('linkedin', ''),
                    'education': data.get('education', ''),
                    'languages': data.get('languages', 'English'),
                    'availability': data.get('availability', 'full-time'),
                    'rating': 0.00,
                    'total_reviews': 0,
                    'total_projects': 0,
                    'completed_projects': 0,
                    'total_earnings': 0.00,
                    'success_rate': 0.00,
                }
                
                try:
                    supabase.table('accounts_developerprofile').insert(developer_profile_data).execute()
                except Exception as e:
                    print(f"Warning: Could not create developer profile: {str(e)}")
                
                return JsonResponse({
                    'message': 'Developer registered successfully',
                    'user': {
                        'id': auth_response.user.id,
                        'email': auth_response.user.email,
                        'first_name': data['firstName'],
                        'last_name': data['lastName'],
                        'user_type': 'developer'
                    },
                    'session': {
                        'access_token': auth_response.session.access_token if auth_response.session else None,
                        'refresh_token': auth_response.session.refresh_token if auth_response.session else None
                    }
                })
            else:
                return JsonResponse({'error': 'Registration failed'}, status=400)
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def register_company(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            supabase = get_supabase_client()
            
            # Use Supabase Auth to create user
            auth_response = supabase.auth.sign_up({
                "email": data['email'],
                "password": data['password'],
                "options": {
                    "data": {
                        "first_name": data['companyName'],
                        "last_name": "",
                        "user_type": "company",
                        "phone": data.get('phone', ''),
                        "country": data['country'],
                        "city": data.get('city', '')
                    }
                }
            })
            
            if auth_response.user:
                user_id = auth_response.user.id
                
                # Create company profile in Supabase
                company_profile_data = {
                    'user_id': user_id,
                    'company_name': data.get('companyName', ''),
                    'company_size': data.get('companySize', '1-10'),
                    'industry': data.get('industry', ''),
                    'website': data.get('website', ''),
                    'description': data.get('description', ''),
                    'founded_year': int(data.get('foundedYear', 2026)) if data.get('foundedYear') else 2026,
                    'company_type': data.get('companyType', 'startup'),
                    'is_verified': False,
                }
                
                try:
                    supabase.table('accounts_companyprofile').insert(company_profile_data).execute()
                except Exception as e:
                    print(f"Warning: Could not create company profile: {str(e)}")
                
                return JsonResponse({
                    'message': 'Company registered successfully',
                    'user': {
                        'id': auth_response.user.id,
                        'email': auth_response.user.email,
                        'first_name': data['companyName'],
                        'last_name': '',
                        'user_type': 'company'
                    },
                    'session': {
                        'access_token': auth_response.session.access_token if auth_response.session else None,
                        'refresh_token': auth_response.session.refresh_token if auth_response.session else None
                    }
                })
            else:
                return JsonResponse({'error': 'Registration failed'}, status=400)
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data['email']
            password = data['password']
            user_type = data['userType']
            
            supabase = get_supabase_client()
            
            # Use Supabase Auth to sign in with email confirmation bypass
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            # If user exists but email not confirmed, try to confirm it automatically
            if not auth_response.user and "Email not confirmed" in str(auth_response):
                try:
                    # Get user by email and confirm
                    admin_response = supabase.auth.admin.get_user_by_email(email)
                    if admin_response.user:
                        # Confirm the user
                        supabase.auth.admin.update_user_by_id(
                            admin_response.user.id,
                            {"email_confirm": True}
                        )
                        # Try login again
                        auth_response = supabase.auth.sign_in_with_password({
                            "email": email,
                            "password": password
                        })
                except Exception as e:
                    print(f"Auto-confirm failed: {str(e)}")
            
            if auth_response.user:
                user_metadata = auth_response.user.user_metadata or {}
                
                # Check if user type matches
                if user_metadata.get('user_type') != user_type:
                    return JsonResponse({'error': 'Invalid user type'}, status=401)
                
                return JsonResponse({
                    'message': 'Login successful',
                    'user': {
                        'id': auth_response.user.id,
                        'email': auth_response.user.email,
                        'first_name': user_metadata.get('first_name', ''),
                        'last_name': user_metadata.get('last_name', ''),
                        'user_type': user_metadata.get('user_type', '')
                    },
                    'session': {
                        'access_token': auth_response.session.access_token,
                        'refresh_token': auth_response.session.refresh_token
                    }
                })
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
        except Exception as e:
            print(f"Login error: {str(e)}")
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_user_profile(request):
    if request.method == 'GET':
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return JsonResponse({'error': 'No authorization token'}, status=401)
            
            token = auth_header.replace('Bearer ', '')
            supabase = get_supabase_client()
            
            # Verify token and get user
            user_response = supabase.auth.get_user(token)
            if user_response.user:
                user_metadata = user_response.user.user_metadata or {}
                
                return JsonResponse({
                    'user': {
                        'id': user_response.user.id,
                        'email': user_response.user.email,
                        'first_name': user_metadata.get('first_name', ''),
                        'last_name': user_metadata.get('last_name', ''),
                        'user_type': user_metadata.get('user_type', '')
                    }
                })
            else:
                return JsonResponse({'error': 'Invalid token'}, status=401)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_projects(request):
    if request.method == 'GET':
        try:
            supabase = get_supabase_client()
            
            # Get all projects from Supabase
            result = supabase.table('projects_project').select('*').execute()
            
            print(f"Total projects from Supabase: {len(result.data)}")
            
            projects = []
            for project in result.data:
                print(f"  - {project.get('title')} (status: {project.get('status')})")
                
                # Filter out draft and cancelled projects
                if project.get('status') not in ['draft', 'cancelled']:
                    projects.append({
                        'id': project.get('id'),
                        'title': project.get('title'),
                        'description': project.get('description'),
                        'budget_min': float(project.get('budget_min', 0)) if project.get('budget_min') else 0,
                        'budget_max': float(project.get('budget_max', 0)) if project.get('budget_max') else 0,
                        'category': project.get('category', ''),
                        'complexity': project.get('complexity', ''),
                        'tech_stack': project.get('tech_stack', []),
                        'estimated_duration': project.get('estimated_duration', ''),
                        'created_at': project.get('created_at', ''),
                        'company': project.get('company_name', 'Company')
                    })
            
            print(f"Returning {len(projects)} visible projects")
            return JsonResponse({'projects': projects})
        except Exception as e:
            print(f"Get projects error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'projects': [], 'error': str(e)})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_company_projects(request):
    if request.method == 'GET':
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
            
            # Get user from Django database by email
            from accounts.models import User
            try:
                user = User.objects.get(email=user_response.user.email)
                
                # Get all projects for this company
                from projects.models import Project
                projects_queryset = Project.objects.filter(
                    company=user
                ).values(
                    'id', 'title', 'description', 'budget_min', 'budget_max',
                    'category', 'complexity', 'tech_stack', 'estimated_duration',
                    'status', 'created_at', 'applications_count'
                )
                
                projects = []
                for project in projects_queryset:
                    projects.append({
                        'id': project['id'],
                        'title': project['title'],
                        'description': project['description'],
                        'budget_min': float(project['budget_min']) if project['budget_min'] else 0,
                        'budget_max': float(project['budget_max']) if project['budget_max'] else 0,
                        'category': project['category'],
                        'complexity': project['complexity'],
                        'tech_stack': project['tech_stack'] if isinstance(project['tech_stack'], list) else [],
                        'estimated_duration': project['estimated_duration'],
                        'status': project['status'],
                        'created_at': project['created_at'].isoformat() if project['created_at'] else '',
                        'applications_count': project['applications_count']
                    })
                
                return JsonResponse({'projects': projects})
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
            
        except Exception as e:
            print(f"Get company projects error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def edit_project(request, project_id):
    if request.method == 'GET':
        try:
            from projects.models import Project
            
            project = Project.objects.get(id=project_id)
            
            return JsonResponse({
                'project': {
                    'id': project.id,
                    'title': project.title,
                    'description': project.description,
                    'category': project.category,
                    'complexity': project.complexity,
                    'budget_min': float(project.budget_min) if project.budget_min else 0,
                    'budget_max': float(project.budget_max) if project.budget_max else 0,
                    'estimated_duration': project.estimated_duration,
                    'tech_stack': project.tech_stack,
                    'status': project.status,
                    'created_at': project.created_at.isoformat()
                }
            })
            
        except Exception as e:
            print(f"Get project error: {str(e)}")
            return JsonResponse({'error': 'Project not found'}, status=404)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            from projects.models import Project
            
            project = Project.objects.get(id=project_id)
            
            # Map categories
            category_map = {
                'web-development': 'web',
                'mobile-development': 'mobile',
                'ui-ux-design': 'design',
                'backend-development': 'backend',
                'frontend-development': 'frontend',
                'full-stack-development': 'fullstack'
            }
            
            # Map complexity levels
            complexity_map = {
                'entry': 'simple',
                'intermediate': 'medium', 
                'expert': 'complex'
            }
            
            budget_amount = int(data.get('budget', 1000))
            
            # Update project
            project.title = data.get('title', project.title)
            project.description = data.get('description', project.description)
            project.category = category_map.get(data.get('category'), project.category)
            project.complexity = complexity_map.get(data.get('experience'), project.complexity)
            project.budget_min = budget_amount
            project.budget_max = budget_amount * 1.5
            project.estimated_duration = f"{data.get('timeline', '4')} weeks"
            project.tech_stack = data.get('skills', '').split(',') if isinstance(data.get('skills'), str) else data.get('skills', [])
            project.save()
            
            return JsonResponse({
                'message': 'Project updated successfully',
                'project': {
                    'id': project.id,
                    'title': project.title,
                    'description': project.description,
                    'category': project.category,
                    'complexity': project.complexity,
                    'budget_min': float(project.budget_min),
                    'budget_max': float(project.budget_max),
                    'status': project.status,
                    'created_at': project.created_at.isoformat()
                }
            })
            
        except Exception as e:
            print(f"Update project error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
@csrf_exempt
def apply_to_project(request, project_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return JsonResponse({'error': 'No authorization token'}, status=401)
            
            token = auth_header.replace('Bearer ', '')
            supabase = get_supabase_client()
            
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            
            developer_id = user_response.user.id
            
            # Create application in projects_projectapplication table
            application_data = {
                'project_id': project_id,
                'developer_id': developer_id,
                'cover_letter': data.get('coverLetter', ''),
                'proposed_rate': float(data.get('proposedBudget', 0)) if data.get('proposedBudget') else None,
                'estimated_duration': data.get('timeline', ''),
                'status': 'pending'
            }
            
            result = supabase.table('projects_projectapplication').insert(application_data).execute()
            
            if result.data:
                return JsonResponse({
                    'message': 'Application submitted successfully',
                    'application': result.data[0]
                })
            else:
                return JsonResponse({'error': 'Failed to submit application'}, status=500)
            
        except Exception as e:
            print(f"Apply to project error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_project_applications(request, project_id):
    if request.method == 'GET':
        try:
            supabase = get_supabase_client()
            
            # Get applications sorted by matching_score (highest first)
            result = supabase.table('applications').select('*').eq('project_id', project_id).order('matching_score', desc=True).execute()
            
            return JsonResponse({'applications': result.data})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_developers(request):
    if request.method == 'GET':
        try:
            supabase = get_supabase_client()
            
            # Get all developer users from Supabase Auth
            # For now, return mock data since we're using Auth metadata
            mock_developers = [
                {
                    'id': 1,
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'title': 'Full Stack Developer',
                    'skills': ['React', 'Node.js', 'Python'],
                    'experience': '3 years',
                    'rating': 4.8,
                    'hourly_rate': 50,
                    'location': 'New York, USA'
                },
                {
                    'id': 2,
                    'name': 'Jane Smith',
                    'email': 'jane@example.com',
                    'title': 'UI/UX Designer',
                    'skills': ['Figma', 'Adobe XD', 'React'],
                    'experience': '5 years',
                    'rating': 4.9,
                    'hourly_rate': 60,
                    'location': 'London, UK'
                }
            ]
            
            return JsonResponse({'developers': mock_developers})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def test_endpoint(request):
    return JsonResponse({'message': 'Test endpoint working', 'method': request.method})

@csrf_exempt
@csrf_exempt
def create_project(request):
    if request.method == 'POST':
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
            
            from datetime import datetime, timedelta
            
            # Map categories to match database constraints
            category_map = {
                'web-development': 'web',
                'mobile-development': 'mobile',
                'ui-ux-design': 'design',
                'backend-development': 'backend',
                'frontend-development': 'frontend',
                'full-stack-development': 'fullstack'
            }
            
            # Map complexity levels
            complexity_map = {
                'entry': 'simple',
                'intermediate': 'medium', 
                'expert': 'complex'
            }
            
            budget_amount = int(data.get('budget', 1000))
            
            # Parse dates
            start_date = datetime.now().date().isoformat()
            deadline = (datetime.now() + timedelta(days=30)).date().isoformat()
            
            # Create project in Supabase
            project_data = {
                'company_id': user_response.user.id,
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'category': category_map.get(data.get('category'), 'other'),
                'complexity': complexity_map.get(data.get('experience'), 'simple'),
                'budget_min': budget_amount,
                'budget_max': budget_amount * 1.5,
                'estimated_duration': f"{data.get('timeline', '4')} weeks",
                'tech_stack': data.get('skills', '').split(',') if isinstance(data.get('skills'), str) else data.get('skills', []),
                'status': 'draft',
                'start_date': start_date,
                'deadline': deadline
            }
            
            result = supabase.table('projects_project').insert(project_data).execute()
            
            if result.data:
                return JsonResponse({
                    'message': 'Project created successfully',
                    'project': result.data[0]
                })
            else:
                return JsonResponse({'error': 'Failed to create project'}, status=500)
            
        except Exception as e:
            print(f"Create project error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def edit_project(request, project_id):
    """Edit an existing project"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            user_id = request.user.id if request.user.is_authenticated else None
            
            if not user_id:
                return JsonResponse({'error': 'Unauthorized'}, status=401)
            
            # Update project in Supabase
            supabase.table('projects').update({
                'title': data.get('title'),
                'description': data.get('description'),
                'tech_stack': data.get('tech_stack'),
                'status': data.get('status', 'active'),
                'updated_at': datetime.now().isoformat()
            }).eq('id', project_id).eq('user_id', user_id).execute()
            
            return JsonResponse({'success': True, 'message': 'Project updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
