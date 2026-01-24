"""
Views for Figma verification workflow.
Handles shortlisting, Figma submission, and OpenCLIP evaluation.
Uses Supabase for data storage and authentication.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
import json

from projects.openclip_service import get_openclip_evaluator
from projects.enhanced_design_evaluator import get_enhanced_evaluator
from accounts.supabase_service import get_supabase_client


def get_user_from_token(request):
    """Extract user from Supabase token"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase_client()
    
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user if user_response else None
    except:
        return None


@csrf_exempt
def shortlist_top_three(request, project_id):
    """
    Shortlist top 3 applicants for Figma submission phase.
    Only for single developer assignment (not team).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    # Get project from Supabase
    supabase = get_supabase_client()
    project_response = supabase.table('projects').select('*').eq('id', project_id).eq('company_id', user.id).execute()
    
    if not project_response.data:
        return JsonResponse({'error': 'Project not found or access denied'}, status=404)
    
    project = project_response.data[0]
    
    # Check if already shortlisted
    shortlist_response = supabase.table('figma_shortlists').select('id').eq('project_id', project_id).execute()
    if shortlist_response.data:
        return JsonResponse({'error': 'Top 3 have already been shortlisted for this project'}, status=400)
    
    # Get top 3 applications by match score
    applications_response = supabase.table('project_applications').select('*').eq('project_id', project_id).eq('status', 'pending').order('match_score', desc=True).limit(3).execute()
    
    top_applications = applications_response.data if applications_response.data else []
    
    if len(top_applications) < 3:
        return JsonResponse({'error': f'Not enough applications. Found {len(top_applications)}, need at least 3.'}, status=400)
    
    # Create shortlist entries
    shortlisted = []
    figma_deadline = (timezone.now() + timedelta(days=7)).isoformat()
    
    for application in top_applications:
        shortlist_data = {
            'project_id': project_id,
            'application_id': application['id'],
            'developer_id': application['developer_id'],
            'figma_deadline': figma_deadline
        }
        
        shortlist_response = supabase.table('figma_shortlists').insert(shortlist_data).execute()
        
        if shortlist_response.data:
            # Update application status
            supabase.table('project_applications').update({'status': 'figma_pending'}).eq('id', application['id']).execute()
            
            # Get developer info - try auth first, fallback to email
            dev_name = 'Developer'
            dev_email = application.get('developer_email', '')
            
            try:
                dev_response = supabase.auth.admin.get_user_by_id(application['developer_id'])
                if dev_response and dev_response.user:
                    dev_name = dev_response.user.user_metadata.get('full_name', 'Developer')
                    dev_email = dev_response.user.email
            except:
                # Fallback: use email from application if available
                pass
            
            shortlisted.append({
                'shortlist_id': shortlist_response.data[0]['id'],
                'developer_id': application['developer_id'],
                'developer_name': dev_name,
                'developer_email': dev_email,
                'match_score': application.get('match_score'),
                'figma_deadline': figma_deadline
            })
    
    # Update project status
    supabase.table('projects').update({'status': 'shortlisting'}).eq('id', project_id).execute()
    
    return JsonResponse({
        'message': 'Top 3 applicants shortlisted successfully',
        'project_id': project_id,
        'project_title': project.get('title'),
        'figma_deadline': figma_deadline,
        'shortlisted_developers': shortlisted
    })


@csrf_exempt
def get_figma_shortlist(request, project_id):
    """Get Figma shortlist for a project"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    user = get_user_from_token(request)
    if not user:
        print(f"❌ get_figma_shortlist: No user found")
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    print(f"🔍 get_figma_shortlist called")
    print(f"   User ID: {user.id}")
    print(f"   Project ID: {project_id}")
    
    supabase = get_supabase_client()
    
    # Get project
    try:
        project_response = supabase.table('projects').select('*').eq('id', project_id).execute()
        if not project_response.data:
            print(f"   ❌ Project not found: {project_id}")
            return JsonResponse({'error': 'Project not found'}, status=404)
        
        project = project_response.data[0]
        print(f"   ✅ Project found: {project.get('title')}")
        print(f"   Company ID: {project['company_id']}")
        print(f"   User ID: {user.id}")
        print(f"   Match: {project['company_id'] == user.id}")
    except Exception as e:
        print(f"   ❌ Error fetching project: {e}")
        return JsonResponse({'error': f'Database error: {str(e)}'}, status=500)
    
    # Check permissions (company owns project or developer is shortlisted)
    if str(project['company_id']) != str(user.id):
        print(f"   ⚠️  User is not company owner, checking if developer...")
        # Check if user is a shortlisted developer
        dev_check = supabase.table('figma_shortlists').select('id').eq('project_id', project_id).eq('developer_id', user.id).execute()
        if not dev_check.data:
            print(f"   ❌ Access denied - not owner and not shortlisted developer")
            return JsonResponse({'error': 'Access denied'}, status=403)
        print(f"   ✅ User is shortlisted developer")
    else:
        print(f"   ✅ User is project owner")
    
    # Get shortlist
    try:
        shortlists_response = supabase.table('figma_shortlists').select('*').eq('project_id', project_id).execute()
        
        print(f"   Shortlists found: {len(shortlists_response.data) if shortlists_response.data else 0}")
        
        if not shortlists_response.data:
            return JsonResponse({
                'project_id': project_id,
                'shortlisted': False,
                'shortlist': []
            })
        
        shortlist_data = []
        for shortlist in shortlists_response.data:
            print(f"   Processing shortlist ID: {shortlist['id']}")
            
            # Get developer info
            try:
                dev_response = supabase.table('users').select('email, user_metadata').eq('id', shortlist['developer_id']).execute()
                dev_name = dev_response.data[0]['user_metadata'].get('full_name', 'Developer') if dev_response.data else 'Developer'
                dev_email = dev_response.data[0]['email'] if dev_response.data else ''
            except Exception as e:
                print(f"   ⚠️  Could not get developer info: {e}")
                dev_name = 'Developer'
                dev_email = ''
            
            # Get application for match score
            try:
                app_response = supabase.table('project_applications').select('match_score').eq('id', shortlist['application_id']).execute()
                match_score = app_response.data[0]['match_score'] if app_response.data else None
            except Exception as e:
                print(f"   ⚠️  Could not get match score: {e}")
                match_score = None
            
            shortlist_data.append({
                'shortlist_id': shortlist['id'],
                'developer_id': shortlist['developer_id'],
                'developer_name': dev_name,
                'developer_email': dev_email,
                'match_score': match_score,
                'figma_deadline': shortlist['figma_deadline'],
                'figma_submitted': bool(shortlist.get('figma_url') or shortlist.get('design_images')),
                'figma_url': shortlist.get('figma_url'),
                'design_images': shortlist.get('design_images', []),
                'submitted_at': shortlist.get('submitted_at'),
                'clip_score': shortlist.get('clip_score'),
                'clip_rank': shortlist.get('clip_rank'),
            })
        
        print(f"   ✅ Returning {len(shortlist_data)} shortlist entries")
        
        return JsonResponse({
            'project_id': project_id,
            'project_title': project.get('title'),
            'shortlisted': True,
            'shortlist': shortlist_data
        })
    
    except Exception as e:
        print(f"   ❌ Error processing shortlist: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Failed to get shortlist: {str(e)}'}, status=500)


@csrf_exempt
def upload_design_image(request):
    """Upload a design image to Supabase storage"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    print(f"📤 Upload request from user: {user.id}")
    print(f"   FILES: {list(request.FILES.keys())}")
    print(f"   POST: {list(request.POST.keys())}")
    
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file provided'}, status=400)
    
    file = request.FILES['file']
    shortlist_id = request.POST.get('shortlist_id')
    
    print(f"   File: {file.name} ({file.size} bytes)")
    print(f"   Shortlist ID: {shortlist_id}")
    
    if not shortlist_id:
        return JsonResponse({'error': 'shortlist_id is required'}, status=400)
    
    supabase = get_supabase_client()
    
    # Verify user owns this shortlist
    try:
        shortlist_response = supabase.table('figma_shortlists').select('*').eq('id', shortlist_id).eq('developer_id', user.id).execute()
        
        if not shortlist_response.data:
            print(f"   ❌ Shortlist not found or access denied")
            return JsonResponse({'error': 'Shortlist not found or access denied'}, status=404)
        
        print(f"   ✅ Shortlist verified")
    except Exception as e:
        print(f"   ❌ Error verifying shortlist: {e}")
        return JsonResponse({'error': f'Database error: {str(e)}'}, status=500)
    
    try:
        # Generate unique filename
        import uuid
        ext = file.name.split('.')[-1] if '.' in file.name else 'jpg'
        filename = f"{user.id}/{shortlist_id}/{uuid.uuid4()}.{ext}"
        
        print(f"   Uploading to: {filename}")
        
        # Upload to Supabase storage
        file_bytes = file.read()
        print(f"   File size: {len(file_bytes)} bytes")
        
        upload_response = supabase.storage.from_('design-images').upload(
            filename,
            file_bytes,
            {'content-type': file.content_type or 'image/jpeg'}
        )
        
        print(f"   Upload response: {upload_response}")
        
        # Get public URL
        public_url = supabase.storage.from_('design-images').get_public_url(filename)
        
        print(f"   ✅ Upload successful: {public_url}")
        
        return JsonResponse({
            'message': 'Image uploaded successfully',
            'image_url': public_url,
            'filename': filename
        })
    
    except Exception as e:
        print(f"   ❌ Upload failed: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Failed to upload image: {str(e)}'}, status=500)


@csrf_exempt
def submit_figma_design(request, shortlist_id):
    """Developer submits Figma design"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    supabase = get_supabase_client()
    
    # Get shortlist entry
    shortlist_response = supabase.table('figma_shortlists').select('*').eq('id', shortlist_id).eq('developer_id', user.id).execute()
    
    if not shortlist_response.data:
        return JsonResponse({'error': 'Shortlist entry not found'}, status=404)
    
    shortlist = shortlist_response.data[0]
    
    # Check if already submitted
    if shortlist.get('figma_url'):
        return JsonResponse({'error': 'Figma design already submitted'}, status=400)
    
    # Check deadline
    if timezone.now().isoformat() > shortlist['figma_deadline']:
        return JsonResponse({'error': 'Figma submission deadline has passed'}, status=400)
    
    # Get data
    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    figma_url = data.get('figma_url')
    figma_description = data.get('figma_description', '')
    design_images = data.get('design_images', [])
    
    if not figma_url and not design_images:
        return JsonResponse({'error': 'Either figma_url or design_images is required'}, status=400)
    
    # Validate Figma URL if provided
    if figma_url and 'figma.com' not in figma_url:
        return JsonResponse({'error': 'Invalid Figma URL'}, status=400)
    
    # Save submission
    update_data = {
        'figma_url': figma_url,
        'figma_description': figma_description,
        'design_images': design_images if design_images else None,
        'submitted_at': timezone.now().isoformat()
    }
    
    supabase.table('figma_shortlists').update(update_data).eq('id', shortlist_id).execute()
    
    # Update application status
    supabase.table('project_applications').update({'status': 'figma_submitted'}).eq('id', shortlist['application_id']).execute()
    
    # Check if all submissions are in
    project_id = shortlist['project_id']
    all_shortlists = supabase.table('figma_shortlists').select('figma_url, design_images').eq('project_id', project_id).execute()
    submitted_count = sum(1 for s in all_shortlists.data if s.get('figma_url') or s.get('design_images'))
    total_count = len(all_shortlists.data)
    
    return JsonResponse({
        'message': 'Figma design submitted successfully',
        'shortlist_id': shortlist_id,
        'figma_url': figma_url,
        'submitted_at': update_data['submitted_at'],
        'all_submitted': submitted_count == total_count,
        'submitted_count': submitted_count,
        'total_count': total_count
    })


@csrf_exempt
def evaluate_figma_submissions(request, project_id):
    """Evaluate all Figma submissions using OpenCLIP"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    supabase = get_supabase_client()
    
    # Get project and verify ownership
    project_response = supabase.table('projects').select('*').eq('id', project_id).eq('company_id', user.id).execute()
    
    if not project_response.data:
        return JsonResponse({'error': 'Project not found or access denied'}, status=404)
    
    project = project_response.data[0]
    
    # Get all shortlist entries
    shortlists_response = supabase.table('figma_shortlists').select('*').eq('project_id', project_id).execute()
    
    if not shortlists_response.data:
        return JsonResponse({'error': 'No shortlist found for this project'}, status=400)
    
    shortlists = shortlists_response.data
    
    # Check if any have submitted
    submitted_count = sum(1 for s in shortlists if s.get('figma_url') or s.get('design_images'))
    
    if submitted_count == 0:
        return JsonResponse({'error': 'No Figma submissions yet'}, status=400)
    
    # Prepare submissions for evaluation
    submissions = []
    for shortlist in shortlists:
        if shortlist.get('figma_url') or shortlist.get('design_images'):
            submissions.append({
                'shortlist_id': shortlist['id'],
                'developer_id': shortlist['developer_id'],
                'figma_url': shortlist.get('figma_url'),
                'design_images': shortlist.get('design_images', [])
            })
    
    try:
        # Try to use enhanced evaluator for better accuracy
        print("🎨 Attempting to load Enhanced Design Evaluator...")
        try:
            evaluator = get_enhanced_evaluator()
            print("✅ Enhanced evaluator loaded successfully")
            use_enhanced = True
        except Exception as e:
            print(f"⚠️  Enhanced evaluator not available: {e}")
            print("   Falling back to basic OpenCLIP evaluator")
            evaluator = get_openclip_evaluator()
            use_enhanced = False
        
        # Evaluate submissions
        if use_enhanced:
            print("🎨 Using Enhanced Multi-Criteria Evaluation...")
            results = evaluator.evaluate_multiple_designs(
                project_description=project['description'],
                submissions=submissions
            )
        else:
            print("🎨 Using Basic CLIP Evaluation...")
            results = evaluator.evaluate_figma_submissions(
                project_description=project['description'],
                submissions=submissions
            )
        
        print(f"✅ Evaluated {len(results)} submissions")
        
        # Save results with detailed breakdown
        for result in results:
            update_data = {
                'clip_score': result['clip_score'],
                'clip_rank': result['rank'],
                'evaluated_at': timezone.now().isoformat()
            }
            
            # Store score breakdown if available (enhanced evaluator only)
            if 'score_breakdown' in result:
                print(f"   Developer {result['developer_id']}: {result['clip_score']}")
                print(f"     - Overall Similarity: {result['score_breakdown']['overall_similarity']:.1f}")
                print(f"     - Design Quality: {result['score_breakdown']['design_quality']:.1f}")
                print(f"     - Requirement Match: {result['score_breakdown']['requirement_match']:.1f}")
                print(f"     - UI Elements: {result['score_breakdown']['ui_elements']:.1f}")
            else:
                print(f"   Developer {result['developer_id']}: {result['clip_score']} (basic scoring)")
            
            supabase.table('figma_shortlists').update(update_data).eq('id', result['shortlist_id']).execute()
        
        evaluation_method = "Enhanced Multi-Criteria" if use_enhanced else "Basic CLIP"
        
        return JsonResponse({
            'message': f'Figma submissions evaluated successfully using {evaluation_method}',
            'project_id': project_id,
            'evaluated_count': len(results),
            'evaluation_method': evaluation_method,
            'results': results
        })
    
    except ImportError as e:
        return JsonResponse({
            'error': 'OpenCLIP is not installed',
            'message': str(e),
            'install_command': 'pip install open-clip-torch pillow torchvision'
        }, status=500)
    except Exception as e:
        return JsonResponse({'error': f'Failed to evaluate submissions: {str(e)}'}, status=500)


@csrf_exempt
def assign_after_figma(request, project_id):
    """Assign project to developer after Figma evaluation"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    supabase = get_supabase_client()
    
    # Get project and verify ownership
    project_response = supabase.table('projects').select('*').eq('id', project_id).eq('company_id', user.id).execute()
    
    if not project_response.data:
        return JsonResponse({'error': 'Project not found or access denied'}, status=404)
    
    project = project_response.data[0]
    
    # Get developer ID from request
    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    developer_id = data.get('developer_id')
    if not developer_id:
        return JsonResponse({'error': 'developer_id is required'}, status=400)
    
    # Get shortlist entry
    shortlist_response = supabase.table('figma_shortlists').select('*').eq('project_id', project_id).eq('developer_id', developer_id).execute()
    
    if not shortlist_response.data:
        return JsonResponse({'error': 'Developer not in shortlist'}, status=404)
    
    shortlist = shortlist_response.data[0]
    
    print(f"🎯 Assigning project to developer: {developer_id}")
    print(f"   Shortlist ID: {shortlist['id']}")
    print(f"   Has figma_url: {bool(shortlist.get('figma_url'))}")
    print(f"   Has design_images: {bool(shortlist.get('design_images'))}")
    print(f"   Design images count: {len(shortlist.get('design_images', []))}")
    
    # Check if Figma was submitted (either URL or images)
    has_submission = shortlist.get('figma_url') or shortlist.get('design_images')
    if not has_submission:
        print(f"   ❌ No submission found")
        return JsonResponse({'error': 'Developer has not submitted Figma design'}, status=400)
    
    print(f"   ✅ Submission found - proceeding with assignment")
    
    # Calculate deadlines
    now = timezone.now()
    figma_deadline = now + timedelta(days=7)
    submission_deadline = now + timedelta(days=30)
    
    # Create single developer assignment (same as team assignment but is_team=False)
    assignment_data = {
        'project_id': project_id,
        'company_id': user.id,
        'team_name': f"Solo - {project['title'][:30]}",
        'figma_deadline': figma_deadline.isoformat(),
        'submission_deadline': submission_deadline.isoformat(),
        'is_team': False
    }
    
    print(f"   Creating team assignment...")
    assignment_response = supabase.table('team_assignments').insert(assignment_data).execute()
    if not assignment_response.data:
        print(f"   ❌ Failed to create assignment")
        return JsonResponse({'error': 'Failed to create assignment'}, status=500)
    
    assignment = assignment_response.data[0]
    assignment_id = assignment['id']
    print(f"   ✅ Assignment created: {assignment_id}")
    
    # Add developer as single member
    member_data = {
        'team_assignment_id': assignment_id,
        'developer_id': developer_id,
        'figma_submitted': True,  # Already submitted during Figma review
        'figma_url': shortlist.get('figma_url'),
        'figma_images': shortlist.get('design_images', []),
        'figma_submitted_at': shortlist.get('submitted_at')
    }
    
    print(f"   Adding team member...")
    supabase.table('team_assignment_members').insert(member_data).execute()
    print(f"   ✅ Team member added")
    
    # Create chat room
    chat_data = {
        'team_assignment_id': assignment_id,
        'created_at': now.isoformat()
    }
    
    print(f"   Creating chat room...")
    chat_response = supabase.table('team_chats').insert(chat_data).execute()
    
    if chat_response.data:
        chat_id = chat_response.data[0]['id']
        print(f"   ✅ Chat room created: {chat_id}")
        
        # Get developer name for welcome message
        dev_name = 'Developer'
        try:
            dev_response = supabase.auth.admin.get_user_by_id(developer_id)
            if dev_response and dev_response.user:
                user_meta = dev_response.user.user_metadata or {}
                dev_name = f"{user_meta.get('first_name', '')} {user_meta.get('last_name', '')}".strip() or dev_response.user.email
        except:
            pass
        
        # Send welcome message with Figma submission info
        welcome_msg = f"🎉 Congratulations {dev_name}! You have been selected for the project '{project['title']}'.\n\n"
        welcome_msg += f"✅ Your Figma design has been reviewed and approved (Score: {shortlist.get('clip_score', 'N/A')}, Rank: #{shortlist.get('clip_rank', 'N/A')}).\n\n"
        
        if shortlist.get('design_images'):
            welcome_msg += f"📐 Figma Images: {len(shortlist.get('design_images', []))} image(s) submitted\n"
        if shortlist.get('figma_url'):
            welcome_msg += f"🔗 Figma URL: {shortlist.get('figma_url')}\n"
        
        welcome_msg += f"\n📅 Final project submission deadline: {submission_deadline.strftime('%B %d, %Y')}\n"
        welcome_msg += f"\nPlease submit your final project files through the Team Assignments page. Good luck! 🚀"
        
        welcome_message = {
            'chat_id': chat_id,
            'sender_id': user.id,
            'message': welcome_msg,
            'message_type': 'system',
            'created_at': now.isoformat()
        }
        supabase.table('team_chat_messages').insert(welcome_message).execute()
        print(f"   ✅ Welcome message sent")
    else:
        print(f"   ⚠️  Chat room creation failed")
    
    # Update application status to selected
    supabase.table('project_applications').update({'status': 'selected'}).eq('id', shortlist['application_id']).execute()
    
    # Reject other applications and send rejection notifications
    from .rejection_notifications import send_rejection_notifications
    import requests
    
    # Get all applications for this project
    all_apps_response = supabase.table('project_applications').select('developer_id').eq('project_id', project_id).execute()
    all_developer_ids = [app['developer_id'] for app in all_apps_response.data] if all_apps_response.data else []
    
    # Update rejected applications
    supabase.table('project_applications').update({'status': 'rejected'}).eq('project_id', project_id).neq('id', shortlist['application_id']).execute()
    
    # Send rejection notifications to non-selected developers
    try:
        rejection_response = requests.post(
            'http://127.0.0.1:8000/api/projects/rejections/send/',
            json={
                'project_id': project_id,
                'selected_developer_ids': [developer_id]
            }
        )
        if rejection_response.status_code == 200:
            print(f"   ✅ Rejection notifications sent")
        else:
            print(f"   ⚠️  Failed to send rejection notifications: {rejection_response.text}")
    except Exception as e:
        print(f"   ⚠️  Error sending rejection notifications: {e}")
    
    # Update project status
    supabase.table('projects').update({'status': 'in_progress'}).eq('id', project_id).execute()
    
    # Get developer info for response
    dev_name = 'Developer'
    try:
        dev_response = supabase.auth.admin.get_user_by_id(developer_id)
        if dev_response and dev_response.user:
            dev_name = dev_response.user.user_metadata.get('full_name', 'Developer')
    except Exception as e:
        print(f"⚠️  Could not get developer name: {e}")
    
    print(f"✅ Project assigned successfully to {dev_name}")
    
    return JsonResponse({
        'message': 'Project assigned successfully',
        'project_id': project_id,
        'developer_id': developer_id,
        'developer_name': dev_name,
        'assignment_id': assignment_id,
        'chat_created': bool(chat_response.data),
        'clip_score': shortlist.get('clip_score'),
        'clip_rank': shortlist.get('clip_rank')
    })


@csrf_exempt
def my_figma_shortlists(request):
    """Get all Figma shortlists for the current developer"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    print(f"🔍 Fetching shortlists for user ID: {user.id}")
    
    supabase = get_supabase_client()
    
    try:
        # Debug: Check what's actually in the table
        all_shortlists = supabase.table('figma_shortlists').select('id, developer_id').execute()
        print(f"📋 Total shortlists in table: {len(all_shortlists.data) if all_shortlists.data else 0}")
        if all_shortlists.data:
            for s in all_shortlists.data[:3]:
                print(f"   - Shortlist {s['id']}: developer_id = {s['developer_id']}")
                print(f"     Match? {s['developer_id'] == user.id}")
        
        # Get all shortlists for this developer
        shortlists_response = supabase.table('figma_shortlists').select('*').eq('developer_id', user.id).execute()
        
        print(f"📊 Found {len(shortlists_response.data) if shortlists_response.data else 0} shortlist entries")
        
        if shortlists_response.data:
            print(f"   First entry developer_id: {shortlists_response.data[0]['developer_id']}")
        
        shortlist_data = []
        for shortlist in shortlists_response.data if shortlists_response.data else []:
            print(f"   Processing shortlist ID: {shortlist['id']}")
            
            # Get project info
            project_response = supabase.table('projects').select('*').eq('id', shortlist['project_id']).execute()
            if not project_response.data:
                print(f"   ⚠️ Project not found for ID: {shortlist['project_id']}")
                continue
            
            project = project_response.data[0]
            print(f"   ✅ Project found: {project['title']}")
            
            # Get company name from user metadata
            company_name = 'Company'
            try:
                # Try to get company info from auth metadata
                company_response = supabase.auth.admin.get_user_by_id(project['company_id'])
                if company_response and company_response.user:
                    company_name = company_response.user.user_metadata.get('full_name', 'Company')
            except Exception as e:
                print(f"   ⚠️ Could not get company name: {e}")
                pass
            
            # Check if winner
            app_response = supabase.table('project_applications').select('status').eq('id', shortlist['application_id']).execute()
            is_winner = app_response.data[0]['status'] == 'selected' if app_response.data else False
            
            shortlist_data.append({
                'shortlist_id': shortlist['id'],
                'project_id': project['id'],
                'project_title': project['title'],
                'project_description': project['description'],
                'company_name': company_name,
                'shortlisted_at': shortlist['shortlisted_at'],
                'figma_deadline': shortlist['figma_deadline'],
                'figma_submitted': bool(shortlist.get('figma_url') or shortlist.get('design_images')),
                'figma_url': shortlist.get('figma_url'),
                'design_images': shortlist.get('design_images', []),
                'submitted_at': shortlist.get('submitted_at'),
                'clip_score': shortlist.get('clip_score'),
                'clip_rank': shortlist.get('clip_rank'),
                'is_winner': is_winner
            })
        
        print(f"✅ Returning {len(shortlist_data)} shortlists")
        
        return JsonResponse({
            'shortlists': shortlist_data,
            'count': len(shortlist_data)
        })
    except Exception as e:
        print(f"❌ Error in my_figma_shortlists: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'error': str(e),
            'shortlists': [],
            'count': 0
        })
