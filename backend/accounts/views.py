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
                # Create user in Django database
                from accounts.models import User, DeveloperProfile
                
                # Create Django User
                django_user = User.objects.create_user(
                    username=data['email'],  # Use email as username
                    email=data['email'],
                    password=data['password'],
                    first_name=data['firstName'],
                    last_name=data['lastName'],
                    user_type='developer',
                    phone=data.get('phone', ''),
                    country=data['country'],
                    city=data.get('city', '')
                )
                
                # Create Django DeveloperProfile
                DeveloperProfile.objects.create(
                    user=django_user,
                    title=data.get('title', 'Developer'),
                    bio=data.get('bio', ''),
                    hourly_rate=float(data.get('hourlyRate', 25)) if data.get('hourlyRate') else 25.00,
                    skills=data.get('skills', 'JavaScript,HTML,CSS'),
                    experience=data.get('experience', 'entry'),
                    years_experience=int(data.get('yearsExperience', 0)) if data.get('yearsExperience') else 0,
                    portfolio=data.get('portfolio', ''),
                    github=data.get('github', ''),
                    linkedin=data.get('linkedin', ''),
                    education=data.get('education', ''),
                    languages=data.get('languages', 'English'),
                    availability=data.get('availability', 'full-time')
                )
                
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
            import traceback
            traceback.print_exc()
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
                # Create user in Django database
                from accounts.models import User, CompanyProfile
                
                # Create Django User
                django_user = User.objects.create_user(
                    username=data['email'],  # Use email as username
                    email=data['email'],
                    password=data['password'],
                    first_name=data['companyName'],
                    last_name='',
                    user_type='company',
                    phone=data.get('phone', ''),
                    country=data['country'],
                    city=data.get('city', '')
                )
                
                # Create Django CompanyProfile
                CompanyProfile.objects.create(
                    user=django_user,
                    company_name=data.get('companyName', ''),
                    company_size=data.get('companySize', '1-10'),
                    industry=data.get('industry', ''),
                    website=data.get('website', ''),
                    description=data.get('description', ''),
                    founded_year=int(data.get('foundedYear', 2026)) if data.get('foundedYear') else 2026,
                    company_type=data.get('companyType', 'startup'),
                    is_verified=False
                )
                
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
            import traceback
            traceback.print_exc()
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
            
            # Use Supabase Auth to sign in
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            # If user exists but email not confirmed, try to confirm it automatically
            if not auth_response.user and "Email not confirmed" in str(auth_response):
                try:
                    admin_response = supabase.auth.admin.get_user_by_email(email)
                    if admin_response.user:
                        supabase.auth.admin.update_user_by_id(
                            admin_response.user.id,
                            {"email_confirm": True}
                        )
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
                
                # Ensure user exists in Django database
                from accounts.models import User, DeveloperProfile, CompanyProfile
                try:
                    django_user = User.objects.get(email=email)
                except User.DoesNotExist:
                    # Create Django user if doesn't exist (for legacy users)
                    print(f"Creating Django user for existing Supabase user: {email}")
                    django_user = User.objects.create_user(
                        username=email,
                        email=email,
                        password=password,
                        first_name=user_metadata.get('first_name', ''),
                        last_name=user_metadata.get('last_name', ''),
                        user_type=user_type,
                        phone=user_metadata.get('phone', ''),
                        country=user_metadata.get('country', ''),
                        city=user_metadata.get('city', '')
                    )
                    
                    # Create profile if doesn't exist
                    if user_type == 'developer':
                        if not hasattr(django_user, 'developerprofile'):
                            DeveloperProfile.objects.create(
                                user=django_user,
                                title='Developer',
                                skills='JavaScript,HTML,CSS',
                                experience='entry',
                                years_experience=0
                            )
                    elif user_type == 'company':
                        if not hasattr(django_user, 'companyprofile'):
                            CompanyProfile.objects.create(
                                user=django_user,
                                company_name=user_metadata.get('first_name', 'Company'),
                                company_size='1-10',
                                industry='Technology',
                                description='Company description'
                            )
                
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
            import traceback
            traceback.print_exc()
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
            from projects.models import Project
            
            # Get all projects that are open for applications
            projects_queryset = Project.objects.filter(
                status='open'
            ).select_related('company').values(
                'id', 'title', 'description', 'budget_min', 'budget_max',
                'category', 'complexity', 'tech_stack', 'estimated_duration',
                'created_at', 'company__first_name', 'company__last_name'
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
                    'created_at': project['created_at'].isoformat() if project['created_at'] else '',
                    'company': f"{project['company__first_name']} {project['company__last_name']}"
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
            
            # Get Django user by email
            from accounts.models import User
            from projects.models import Project, ProjectApplication
            from projects.matcher import get_matcher
            
            try:
                user = User.objects.get(email=user_response.user.email)
                project = Project.objects.get(id=project_id)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
            except Project.DoesNotExist:
                return JsonResponse({'error': 'Project not found'}, status=404)
            
            # Check if already applied
            if ProjectApplication.objects.filter(project=project, developer=user).exists():
                return JsonResponse({'error': 'You have already applied to this project'}, status=400)
            
            # Create application
            application = ProjectApplication.objects.create(
                project=project,
                developer=user,
                cover_letter=data.get('coverLetter', ''),
                proposed_rate=float(data.get('proposedBudget', 0)) if data.get('proposedBudget') else None,
                estimated_duration=data.get('timeline', ''),
                status='pending'
            )
            
            # Calculate ML match scores
            try:
                matcher = get_matcher()
                developer_profile = user.developerprofile
                
                # Extract features and get match details
                match_details = matcher.get_match_details(application)
                
                if match_details:
                    # Update application with ML scores
                    application.match_score = match_details['overall_score']
                    application.skill_match_score = match_details['component_scores']['skill_match']
                    application.experience_fit_score = match_details['component_scores']['experience_fit']
                    application.portfolio_quality_score = match_details['component_scores']['portfolio_quality']
                    application.matching_skills = match_details['matching_skills']
                    application.missing_skills = match_details['missing_skills']
                    application.ai_reasoning = f"Overall match: {match_details['overall_score']}%. Skills matched: {len(match_details['matching_skills'])}/{len(match_details['matching_skills']) + len(match_details['missing_skills'])}"
                    application.save()
            except Exception as e:
                print(f"ML matching error: {str(e)}")
                # Continue even if ML matching fails
            
            # Update project applications count
            project.applications_count = project.applications.count()
            project.save()
            
            return JsonResponse({
                'message': 'Application submitted successfully',
                'application': {
                    'id': application.id,
                    'project_id': project.id,
                    'match_score': application.match_score,
                    'status': application.status,
                    'applied_at': application.applied_at.isoformat()
                }
            })
            
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
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return JsonResponse({'error': 'No authorization token'}, status=401)
            
            token = auth_header.replace('Bearer ', '')
            supabase = get_supabase_client()
            
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            
            from accounts.models import User
            from projects.models import Project, ProjectApplication
            
            try:
                user = User.objects.get(email=user_response.user.email)
                project = Project.objects.get(id=project_id)
                
                # Verify user owns the project
                if project.company != user:
                    return JsonResponse({'error': 'Unauthorized'}, status=403)
                
                # Get all applications sorted by match score
                applications = ProjectApplication.objects.filter(
                    project=project
                ).select_related('developer', 'developer__developerprofile').order_by('-match_score')
                
                applications_data = []
                for app in applications:
                    try:
                        profile = app.developer.developerprofile
                        applications_data.append({
                            'id': app.id,
                            'developer_name': app.developer.get_full_name(),
                            'developer_title': profile.title,
                            'developer_email': app.developer.email,
                            'cover_letter': app.cover_letter,
                            'proposed_rate': float(app.proposed_rate) if app.proposed_rate else None,
                            'estimated_duration': app.estimated_duration,
                            'status': app.status,
                            'applied_at': app.applied_at.isoformat(),
                            'match_score': app.match_score,
                            'skill_match_score': app.skill_match_score,
                            'experience_fit_score': app.experience_fit_score,
                            'portfolio_quality_score': app.portfolio_quality_score,
                            'matching_skills': app.matching_skills,
                            'missing_skills': app.missing_skills,
                            'ai_reasoning': app.ai_reasoning,
                            'developer_stats': {
                                'rating': float(profile.rating),
                                'total_projects': profile.total_projects,
                                'success_rate': float(profile.success_rate),
                                'years_experience': profile.years_experience
                            }
                        })
                    except Exception as e:
                        print(f"Error processing application {app.id}: {e}")
                        continue
                
                return JsonResponse({'applications': applications_data})
                
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
            except Project.DoesNotExist:
                return JsonResponse({'error': 'Project not found'}, status=404)
            
        except Exception as e:
            print(f"Get applications error: {str(e)}")
            import traceback
            traceback.print_exc()
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
def get_developer_profile(request, developer_email):
    """Get developer profile by email"""
    if request.method == 'GET':
        try:
            from accounts.models import User, DeveloperProfile
            
            # Find user by email
            user = User.objects.get(email=developer_email, user_type='developer')
            profile = user.developerprofile
            
            return JsonResponse({
                'developer': {
                    'id': user.id,
                    'name': user.get_full_name(),
                    'email': user.email,
                    'title': profile.title,
                    'bio': profile.bio,
                    'skills': profile.skills,
                    'experience': profile.experience,
                    'years_experience': profile.years_experience,
                    'hourly_rate': float(profile.hourly_rate) if profile.hourly_rate else None,
                    'rating': float(profile.rating),
                    'total_projects': profile.total_projects,
                    'completed_projects': profile.completed_projects,
                    'success_rate': float(profile.success_rate),
                    'portfolio': profile.portfolio,
                    'github': profile.github,
                    'linkedin': profile.linkedin,
                    'dribbble': profile.dribbble,
                    'behance': profile.behance,
                    'education': profile.education,
                    'languages': profile.languages,
                    'availability': profile.availability,
                }
            })
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'Developer not found'}, status=404)
        except Exception as e:
            print(f"Get developer profile error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def test_endpoint(request):
    return JsonResponse({'message': 'Test endpoint working', 'method': request.method})

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
            
            # Get Django user by email
            from accounts.models import User
            try:
                user = User.objects.get(email=user_response.user.email)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found in database'}, status=404)
            
            from datetime import datetime, timedelta
            from projects.models import Project
            
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
            start_date = datetime.now().date()
            deadline = (datetime.now() + timedelta(days=30)).date()
            
            # Create project in Django database
            project = Project.objects.create(
                company=user,
                title=data.get('title', ''),
                description=data.get('description', ''),
                category=category_map.get(data.get('category'), 'other'),
                complexity=complexity_map.get(data.get('experience'), 'simple'),
                budget_min=budget_amount,
                budget_max=budget_amount * 1.5,
                estimated_duration=f"{data.get('timeline', '4')} weeks",
                tech_stack=data.get('skills', '').split(',') if isinstance(data.get('skills'), str) else data.get('skills', []),
                status='open',  # Set to 'open' so it's visible
                start_date=start_date,
                deadline=deadline
            )
            
            return JsonResponse({
                'message': 'Project created successfully',
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
