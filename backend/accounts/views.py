from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from .supabase_client import get_supabase_client
from .supabase_service import SupabaseService

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
                # Create developer profile in Supabase
                profile_data = {
                    'user_id': auth_response.user.id,
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
                    'rating': 0.0,
                    'total_reviews': 0,
                    'total_projects': 0,
                    'completed_projects': 0,
                    'total_earnings': 0.0,
                    'success_rate': 0.0
                }
                
                supabase.table('developer_profiles').insert(profile_data).execute()
                
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
                        'refresh_token': auth_response.session.refresh_token if auth_response.session else None,
                        'user_id': auth_response.user.id
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
                # Create company profile in Supabase
                profile_data = {
                    'user_id': auth_response.user.id,
                    'company_name': data.get('companyName', ''),
                    'company_size': data.get('companySize', '1-10'),
                    'industry': data.get('industry', ''),
                    'website': data.get('website', ''),
                    'description': data.get('description', ''),
                    'founded_year': int(data.get('foundedYear', 2026)) if data.get('foundedYear') else 2026,
                    'company_type': data.get('companyType', 'startup'),
                    'is_verified': False,
                    'total_projects_posted': 0,
                    'total_spent': 0.0,
                    'average_project_budget': 0.0
                }
                
                supabase.table('company_profiles').insert(profile_data).execute()
                
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
                        'refresh_token': auth_response.session.refresh_token if auth_response.session else None,
                        'user_id': auth_response.user.id
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
                        'refresh_token': auth_response.session.refresh_token,
                        'user_id': auth_response.user.id
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
            supabase = get_supabase_client()
            
            # Get all projects from Supabase (remove status filter temporarily)
            response = supabase.table('projects').select('*').execute()
            all_projects = response.data if response.data else []
            
            print(f"Total projects in database: {len(all_projects)}")
            if all_projects:
                print(f"Sample project statuses: {[p.get('status') for p in all_projects[:3]]}")
            
            # Filter for open projects
            projects = [p for p in all_projects if p.get('status') in ['open', 'active', 'published']]
            
            projects_data = []
            for project in projects:
                # Get company info
                try:
                    company_response = supabase.auth.admin.get_user_by_id(project['company_id'])
                    company_name = "Company"
                    if company_response.user and company_response.user.user_metadata:
                        company_name = company_response.user.user_metadata.get('first_name', 'Company')
                except:
                    company_name = "Company"
                
                projects_data.append({
                    'id': project['id'],
                    'title': project['title'],
                    'description': project['description'],
                    'budget_min': float(project['budget_min']) if project['budget_min'] else 0,
                    'budget_max': float(project['budget_max']) if project['budget_max'] else 0,
                    'category': project['category'],
                    'complexity': project['complexity'],
                    'tech_stack': project['tech_stack'] if isinstance(project['tech_stack'], list) else [],
                    'estimated_duration': project['estimated_duration'],
                    'created_at': project['created_at'],
                    'company': company_name
                })
            
            print(f"Returning {len(projects_data)} visible projects from Supabase")
            return JsonResponse({'projects': projects_data})
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
            
            # Get projects from Supabase
            projects_response = supabase.table('projects').select('*').eq('company_id', user_response.user.id).execute()
            projects = projects_response.data if projects_response.data else []
            
            projects_data = []
            for project in projects:
                # Count applications for this project
                applications_response = supabase.table('project_applications').select('id').eq('project_id', project['id']).execute()
                applications_count = len(applications_response.data) if applications_response.data else 0
                
                projects_data.append({
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
                    'created_at': project['created_at'],
                    'applications_count': applications_count
                })
            
            return JsonResponse({'projects': projects_data})
            
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
            supabase = get_supabase_client()
            
            # Get project from Supabase
            project_response = supabase.table('projects').select('*').eq('id', project_id).execute()
            if not project_response.data:
                return JsonResponse({'error': 'Project not found'}, status=404)
            
            project = project_response.data[0]
            
            return JsonResponse({
                'project': {
                    'id': project['id'],
                    'title': project['title'],
                    'description': project['description'],
                    'category': project['category'],
                    'complexity': project['complexity'],
                    'budget_min': float(project['budget_min']) if project['budget_min'] else 0,
                    'budget_max': float(project['budget_max']) if project['budget_max'] else 0,
                    'estimated_duration': project['estimated_duration'],
                    'tech_stack': project['tech_stack'],
                    'status': project['status'],
                    'created_at': project['created_at']
                }
            })
            
        except Exception as e:
            print(f"Get project error: {str(e)}")
            return JsonResponse({'error': 'Project not found'}, status=404)
    
    elif request.method == 'PUT':
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
            
            # Update project in Supabase
            update_data = {
                'title': data.get('title'),
                'description': data.get('description'),
                'category': category_map.get(data.get('category')),
                'complexity': complexity_map.get(data.get('experience')),
                'budget_min': budget_amount,
                'budget_max': budget_amount * 1.5,
                'estimated_duration': f"{data.get('timeline', '4')} weeks",
                'tech_stack': data.get('skills', '').split(',') if isinstance(data.get('skills'), str) else data.get('skills', []),
                'updated_at': datetime.now().isoformat()
            }
            
            # Remove None values
            update_data = {k: v for k, v in update_data.items() if v is not None}
            
            response = supabase.table('projects').update(update_data).eq('id', project_id).eq('company_id', user_response.user.id).execute()
            
            if not response.data:
                return JsonResponse({'error': 'Project not found or unauthorized'}, status=404)
            
            project = response.data[0]
            
            return JsonResponse({
                'message': 'Project updated successfully',
                'project': {
                    'id': project['id'],
                    'title': project['title'],
                    'description': project['description'],
                    'category': project['category'],
                    'complexity': project['complexity'],
                    'budget_min': float(project['budget_min']),
                    'budget_max': float(project['budget_max']),
                    'status': project['status'],
                    'created_at': project['created_at']
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
            
            # Check if project exists
            project_response = supabase.table('projects').select('*').eq('id', project_id).execute()
            if not project_response.data:
                return JsonResponse({'error': 'Project not found'}, status=404)
            
            # Check if already applied
            existing_app_response = supabase.table('project_applications').select('id').eq('project_id', project_id).eq('developer_id', user_response.user.id).execute()
            if existing_app_response.data:
                return JsonResponse({'error': 'You have already applied to this project'}, status=400)
            
            # Create application data
            application_data = {
                'project_id': project_id,
                'developer_id': user_response.user.id,
                'cover_letter': data.get('coverLetter', ''),
                'proposed_rate': float(data.get('proposedBudget', 0)) if data.get('proposedBudget') else None,
                'estimated_duration': data.get('timeline', ''),
                'status': 'pending'
            }
            
            # Create application
            app_response = supabase.table('project_applications').insert(application_data).execute()
            if not app_response.data:
                return JsonResponse({'error': 'Failed to create application'}, status=500)
            
            application = app_response.data[0]
            
            # Calculate AI match scores using fine-tuned model
            try:
                from projects.simple_fine_tuned_matcher import SimpleMatcher
                
                # Get project data
                project = project_response.data[0]
                
                # Get developer profile
                profile_response = supabase.table('developer_profiles').select('*').eq('user_id', user_response.user.id).execute()
                developer_profile = profile_response.data[0] if profile_response.data else {}
                
                # Initialize matcher and calculate scores
                matcher = SimpleMatcher()
                
                # Prepare application data for scoring
                app_data = {
                    'id': application['id'],
                    'developer_id': user_response.user.id,
                    'cover_letter': application_data['cover_letter'],
                    'proposed_rate': application_data.get('proposed_rate'),
                    'estimated_duration': application_data.get('estimated_duration'),
                    'developer_profile': developer_profile
                }
                
                # Calculate match score
                match_result = matcher.calculate_match_score(project, app_data)
                
                # Convert to integers for database
                match_score = int(round(match_result['overall_score']))
                skill_match = int(round(match_result['component_scores']['skill_match']))
                experience_fit = int(round(match_result['component_scores']['experience_fit']))
                portfolio_quality = int(round(match_result['component_scores']['portfolio_quality']))
                ai_reasoning = match_result['reasoning']
                
                print(f"✅ Calculated AI scores for application {application['id']}: {match_score}%")
                
            except Exception as e:
                print(f"⚠️ Error calculating AI scores, using defaults: {e}")
                # Fallback to basic scores if matcher fails
                match_score = 75
                skill_match = 80
                experience_fit = 70
                portfolio_quality = 75
                ai_reasoning = f"Overall match: {match_score}%. Good skill alignment and experience fit."
            
            # Update application with scores
            update_payload = {
                'match_score': match_score,
                'skill_match_score': skill_match,
                'experience_fit_score': experience_fit,
                'portfolio_quality_score': portfolio_quality,
                'ai_reasoning': ai_reasoning
            }
            
            # Debug: Print types to ensure they're all integers
            print(f"📊 Update payload types:")
            for key, value in update_payload.items():
                print(f"   {key}: {value} (type: {type(value).__name__})")
            
            supabase.table('project_applications').update(update_payload).eq('id', application['id']).execute()
            
            return JsonResponse({
                'message': 'Application submitted successfully',
                'application': {
                    'id': application['id'],
                    'project_id': project_id,
                    'match_score': match_score,
                    'status': application['status'],
                    'applied_at': application['applied_at']
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
            
            # Verify user owns the project
            project_response = supabase.table('projects').select('*').eq('id', project_id).execute()
            if not project_response.data:
                return JsonResponse({'error': 'Project not found'}, status=404)
            
            project = project_response.data[0]
            if project['company_id'] != user_response.user.id:
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            # Get all applications for this project
            applications_response = supabase.table('project_applications').select('*').eq('project_id', project_id).execute()
            applications = applications_response.data if applications_response.data else []
            
            applications_data = []
            for app in applications:
                try:
                    # Get developer info
                    developer_name = "Developer"
                    developer_email = ""
                    developer_title = "Developer"
                    developer_stats = {
                        'rating': 0.0,
                        'total_projects': 0,
                        'success_rate': 0.0,
                        'years_experience': 0
                    }
                    
                    if app['developer_id']:
                        try:
                            # Get developer user info
                            dev_response = supabase.auth.admin.get_user_by_id(app['developer_id'])
                            if dev_response.user:
                                user_meta = dev_response.user.user_metadata or {}
                                developer_name = f"{user_meta.get('first_name', '')} {user_meta.get('last_name', '')}".strip()
                                developer_email = dev_response.user.email
                            
                            # Get developer profile
                            profile_response = supabase.table('developer_profiles').select('*').eq('user_id', app['developer_id']).execute()
                            if profile_response.data:
                                profile = profile_response.data[0]
                                developer_title = profile.get('title', 'Developer')
                                developer_stats = {
                                    'rating': float(profile.get('rating', 0)),
                                    'total_projects': profile.get('total_projects', 0),
                                    'success_rate': float(profile.get('success_rate', 0)),
                                    'years_experience': profile.get('years_experience', 0)
                                }
                        except Exception as e:
                            print(f"Error getting developer info: {e}")
                    
                    applications_data.append({
                        'id': app['id'],
                        'developer_id': app['developer_id'],  # ADD THIS LINE
                        'developer_name': developer_name or "Developer",
                        'developer_title': developer_title,
                        'developer_email': developer_email,
                        'cover_letter': app['cover_letter'],
                        'proposed_rate': float(app['proposed_rate']) if app['proposed_rate'] else None,
                        'estimated_duration': app['estimated_duration'],
                        'status': app['status'],
                        'applied_at': app['applied_at'],
                        'match_score': app.get('match_score'),
                        'skill_match_score': app.get('skill_match_score'),
                        'experience_fit_score': app.get('experience_fit_score'),
                        'portfolio_quality_score': app.get('portfolio_quality_score'),
                        'matching_skills': app.get('matching_skills', []),
                        'missing_skills': app.get('missing_skills', []),
                        'ai_reasoning': app.get('ai_reasoning', ''),
                        'developer_stats': developer_stats
                    })
                except Exception as e:
                    print(f"Error processing application {app.get('id')}: {e}")
                    continue
            
            # Sort by match score descending
            applications_data.sort(key=lambda x: x.get('match_score', 0), reverse=True)
            
            return JsonResponse({'applications': applications_data})
            
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
            
            # Get all developer profiles from Supabase
            profiles_response = supabase.table('developer_profiles').select('*').execute()
            profiles = profiles_response.data if profiles_response.data else []
            
            developers_data = []
            for profile in profiles:
                try:
                    # Get user info from auth
                    user_response = supabase.auth.admin.get_user_by_id(profile['user_id'])
                    if user_response.user:
                        user_meta = user_response.user.user_metadata or {}
                        name = f"{user_meta.get('first_name', '')} {user_meta.get('last_name', '')}".strip()
                        
                        developers_data.append({
                            'id': profile['user_id'],
                            'name': name or 'Developer',
                            'email': user_response.user.email,
                            'title': profile.get('title', 'Developer'),
                            'skills': profile.get('skills', '').split(',') if profile.get('skills') else [],
                            'experience': profile.get('experience', 'entry'),
                            'years_experience': profile.get('years_experience', 0),
                            'hourly_rate': float(profile.get('hourly_rate', 0)),
                            'rating': float(profile.get('rating', 0)),
                            'location': f"{user_meta.get('city', '')}, {user_meta.get('country', '')}".strip(', '),
                            'availability': profile.get('availability', 'available')
                        })
                except Exception as e:
                    print(f"Error processing developer {profile.get('user_id')}: {e}")
                    continue
            
            return JsonResponse({'developers': developers_data})
            
        except Exception as e:
            print(f"Get developers error: {str(e)}")
            return JsonResponse({'developers': [], 'error': str(e)})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_developer_profile(request, developer_email):
    """Get developer profile by email"""
    if request.method == 'GET':
        try:
            supabase = get_supabase_client()
            
            print(f"Looking for developer with email: {developer_email}")
            
            # Get user by email from Supabase Auth
            try:
                admin_response = supabase.auth.admin.list_users()
                user = None
                
                # Find user by email
                for u in admin_response:
                    if u.email == developer_email:
                        user = u
                        break
                
                if not user:
                    print(f"User not found in auth: {developer_email}")
                    return JsonResponse({'error': 'Developer not found'}, status=404)
                user_metadata = user.user_metadata or {}
                
                print(f"Found user: {user.id}, type: {user_metadata.get('user_type')}")
                
                # Check if user is a developer
                if user_metadata.get('user_type') != 'developer':
                    return JsonResponse({'error': 'User is not a developer'}, status=404)
                
                # Get developer profile from Supabase
                profile_response = supabase.table('developer_profiles').select('*').eq('user_id', user.id).execute()
                
                if not profile_response.data:
                    print(f"Profile not found for user: {user.id}")
                    return JsonResponse({'error': 'Developer profile not found'}, status=404)
                
                profile = profile_response.data[0]
                print(f"Found profile: {profile.get('title')}")
                
                return JsonResponse({
                    'developer': {
                        'id': user.id,
                        'name': f"{user_metadata.get('first_name', '')} {user_metadata.get('last_name', '')}".strip(),
                        'email': user.email,
                        'title': profile['title'],
                        'bio': profile['bio'],
                        'skills': profile['skills'],
                        'experience': profile['experience'],
                        'years_experience': profile['years_experience'],
                        'hourly_rate': float(profile['hourly_rate']) if profile['hourly_rate'] else None,
                        'rating': float(profile['rating']),
                        'total_projects': profile['total_projects'],
                        'completed_projects': profile['completed_projects'],
                        'success_rate': float(profile['success_rate']),
                        'portfolio': profile['portfolio'],
                        'github': profile['github'],
                        'linkedin': profile['linkedin'],
                        'dribbble': profile.get('dribbble', ''),
                        'behance': profile.get('behance', ''),
                        'education': profile['education'],
                        'languages': profile['languages'],
                        'availability': profile['availability'],
                    }
                })
                
            except Exception as e:
                print(f"Error getting user by email: {str(e)}")
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

from .team_service import create_team, get_company_teams, add_member_to_team

@csrf_exempt
def create_company_team(request):
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
            
            team = create_team(
                company_id=user_response.user.id,
                team_name=data.get('team_name'),
                description=data.get('description', '')
            )
            
            if team:
                return JsonResponse({'success': True, 'team': team})
            else:
                return JsonResponse({'success': False, 'error': 'Failed to create team'})
                
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def get_teams(request):
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
            
            teams = get_company_teams(user_response.user.id)
            return JsonResponse({'success': True, 'teams': teams})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def add_to_team(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            team_id = data.get('team_id')
            developer_id = data.get('developer_id')
            role = data.get('role', 'Developer')
            
            member = add_member_to_team(team_id, developer_id, role)
            
            if member:
                return JsonResponse({'success': True, 'member': member})
            else:
                return JsonResponse({'success': False, 'error': 'Already in team or failed to add'})
                
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

from .team_formation import suggest_optimal_team

@csrf_exempt
def get_team_suggestions(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            project_id = data.get('project_id')
            required_skills = data.get('required_skills', [])
            budget = data.get('budget', 5000)
            team_size = data.get('team_size', 3)
            
            suggestions = suggest_optimal_team(project_id, required_skills, budget, team_size)
            return JsonResponse({'success': True, 'suggestions': suggestions})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

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
            
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            
            from datetime import datetime, timedelta
            
            category_map = {
                'web-development': 'web',
                'mobile-development': 'mobile',
                'ui-ux-design': 'design',
                'backend-development': 'backend',
                'frontend-development': 'frontend',
                'full-stack-development': 'fullstack'
            }
            
            complexity_map = {
                'entry': 'simple',
                'intermediate': 'medium', 
                'expert': 'complex'
            }
            
            budget_amount = int(data.get('budget', 1000))
            
            project_data = {
                'company_id': user_response.user.id,
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'category': category_map.get(data.get('category'), 'web'),
                'complexity': complexity_map.get(data.get('experience'), 'simple'),
                'budget_min': budget_amount,
                'budget_max': budget_amount * 1.5,
                'estimated_duration': f"{data.get('timeline', '4')} weeks",
                'tech_stack': data.get('skills', '').split(',') if isinstance(data.get('skills'), str) else data.get('skills', []),
                'status': 'open',
                'start_date': datetime.now().date().isoformat(),
                'end_date': (datetime.now() + timedelta(days=30)).date().isoformat()
            }
            
            response = supabase.table('projects').insert(project_data).execute()
            
            if not response.data:
                return JsonResponse({'error': 'Failed to create project'}, status=500)
            
            project = response.data[0]
            
            return JsonResponse({
                'message': 'Project created successfully',
                'project': {
                    'id': project['id'],
                    'title': project['title'],
                    'description': project['description'],
                    'category': project['category'],
                    'complexity': project['complexity'],
                    'budget_min': float(project['budget_min']),
                    'budget_max': float(project['budget_max']),
                    'status': project['status'],
                    'created_at': project['created_at']
                }
            })
            
        except Exception as e:
            print(f"Create project error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
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
            from projects.supabase_service import ProjectSupabaseService
            
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
            end_date = (datetime.now() + timedelta(days=30)).date()
            
            # Create project data
            project_data = {
                'company_id': user_response.user.id,
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'category': category_map.get(data.get('category'), 'web'),
                'complexity': complexity_map.get(data.get('experience'), 'simple'),
                'budget_min': budget_amount,
                'budget_max': budget_amount * 1.5,
                'estimated_duration': f"{data.get('timeline', '4')} weeks",
                'tech_stack': data.get('skills', '').split(',') if isinstance(data.get('skills'), str) else data.get('skills', []),
                'status': 'open',
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
            
            # Create project in Supabase
            service = ProjectSupabaseService()
            project = service.create_project(project_data)
            
            if not project:
                return JsonResponse({'error': 'Failed to create project'}, status=500)
            
            return JsonResponse({
                'message': 'Project created successfully',
                'project': {
                    'id': project['id'],
                    'title': project['title'],
                    'description': project['description'],
                    'category': project['category'],
                    'complexity': project['complexity'],
                    'budget_min': float(project['budget_min']),
                    'budget_max': float(project['budget_max']),
                    'status': project['status'],
                    'created_at': project['created_at']
                }
            })
            
        except Exception as e:
            print(f"Create project error: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


