"""
Team Assignment Views - Handle team creation and project assignments
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .supabase_service import ProjectSupabaseService
from accounts.supabase_client import get_supabase_client


class TeamAssignmentViewSet(viewsets.ViewSet):
    """ViewSet for team-based project assignments"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ProjectSupabaseService()
        self.supabase = get_supabase_client()
    
    @action(detail=False, methods=['post'])
    def create_team_assignment(self, request):
        """Create a team and assign project to multiple developers"""
        try:
            project_id = request.data.get('project_id')
            team_name = request.data.get('team_name')
            developer_ids = request.data.get('developer_ids', [])  # List of developer IDs
            
            if not project_id or not team_name or not developer_ids:
                return Response(
                    {'error': 'project_id, team_name, and developer_ids are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get authorization
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            company_id = user_response.user.id
            
            # Verify project belongs to company
            project_response = self.supabase.table('projects').select('*').eq('id', project_id).eq('company_id', company_id).execute()
            if not project_response.data:
                return Response({'error': 'Project not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
            
            project = project_response.data[0]
            
            # Check if project already assigned
            existing_assignment = self.supabase.table('team_assignments').select('id').eq('project_id', project_id).execute()
            if existing_assignment.data:
                return Response({'error': 'Project already assigned'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate deadlines
            now = timezone.now()
            figma_deadline = now + timedelta(days=7)
            submission_deadline = now + timedelta(days=30)
            
            # Create team assignment
            team_assignment_data = {
                'project_id': project_id,
                'company_id': company_id,
                'team_name': team_name,
                'figma_deadline': figma_deadline.isoformat(),
                'submission_deadline': submission_deadline.isoformat(),
                'is_team': True
            }
            
            team_assignment_response = self.supabase.table('team_assignments').insert(team_assignment_data).execute()
            if not team_assignment_response.data:
                return Response({'error': 'Failed to create team assignment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            team_assignment = team_assignment_response.data[0]
            team_assignment_id = team_assignment['id']
            
            # Add team members
            for developer_id in developer_ids:
                member_data = {
                    'team_assignment_id': team_assignment_id,
                    'developer_id': developer_id
                }
                self.supabase.table('team_assignment_members').insert(member_data).execute()
                
                # Update application status to selected
                self.supabase.table('project_applications').update({'status': 'selected'}).eq('project_id', project_id).eq('developer_id', developer_id).execute()
            
            # Create team chat group
            chat_data = {
                'team_assignment_id': team_assignment_id,
                'created_at': now.isoformat()
            }
            chat_response = self.supabase.table('team_chats').insert(chat_data).execute()
            
            if chat_response.data:
                chat_id = chat_response.data[0]['id']
                
                # Send welcome message
                welcome_message = {
                    'chat_id': chat_id,
                    'sender_id': company_id,
                    'message': f"Welcome to the team '{team_name}'! You have been selected for the project '{project['title']}'. Please submit Figma designs within 7 days and final project within 30 days.",
                    'message_type': 'system',
                    'created_at': now.isoformat()
                }
                self.supabase.table('team_chat_messages').insert(welcome_message).execute()
            
            # Update project status
            self.supabase.table('projects').update({'status': 'in_progress'}).eq('id', project_id).execute()
            
            return Response({
                'success': True,
                'team_assignment': team_assignment,
                'message': f'Team "{team_name}" created and assigned successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def assign_single_developer(self, request):
        """Assign project to a single developer"""
        try:
            project_id = request.data.get('project_id')
            developer_id = request.data.get('developer_id')
            application_id = request.data.get('application_id')
            
            if not project_id or not developer_id:
                return Response(
                    {'error': 'project_id and developer_id are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get authorization
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            company_id = user_response.user.id
            
            # Verify project belongs to company
            project_response = self.supabase.table('projects').select('*').eq('id', project_id).eq('company_id', company_id).execute()
            if not project_response.data:
                return Response({'error': 'Project not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
            
            project = project_response.data[0]
            
            # Check if project already assigned
            existing_assignment = self.supabase.table('team_assignments').select('id').eq('project_id', project_id).execute()
            if existing_assignment.data:
                return Response({'error': 'Project already assigned'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate deadlines
            now = timezone.now()
            figma_deadline = now + timedelta(days=7)
            submission_deadline = now + timedelta(days=30)
            
            # Create single developer assignment
            assignment_data = {
                'project_id': project_id,
                'company_id': company_id,
                'team_name': f"Solo - {project['title'][:30]}",
                'figma_deadline': figma_deadline.isoformat(),
                'submission_deadline': submission_deadline.isoformat(),
                'is_team': False
            }
            
            assignment_response = self.supabase.table('team_assignments').insert(assignment_data).execute()
            if not assignment_response.data:
                return Response({'error': 'Failed to create assignment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            assignment = assignment_response.data[0]
            assignment_id = assignment['id']
            
            # Add developer as single member
            member_data = {
                'team_assignment_id': assignment_id,
                'developer_id': developer_id
            }
            self.supabase.table('team_assignment_members').insert(member_data).execute()
            
            # Update application status
            if application_id:
                self.supabase.table('project_applications').update({'status': 'selected'}).eq('id', application_id).execute()
            else:
                self.supabase.table('project_applications').update({'status': 'selected'}).eq('project_id', project_id).eq('developer_id', developer_id).execute()
            
            # Create chat
            chat_data = {
                'team_assignment_id': assignment_id,
                'created_at': now.isoformat()
            }
            chat_response = self.supabase.table('team_chats').insert(chat_data).execute()
            
            if chat_response.data:
                chat_id = chat_response.data[0]['id']
                
                # Send welcome message
                welcome_message = {
                    'chat_id': chat_id,
                    'sender_id': company_id,
                    'message': f"Congratulations! You have been selected for the project '{project['title']}'. Please submit Figma designs within 7 days and final project within 30 days.",
                    'message_type': 'system',
                    'created_at': now.isoformat()
                }
                self.supabase.table('team_chat_messages').insert(welcome_message).execute()
            
            # Update project status
            self.supabase.table('projects').update({'status': 'in_progress'}).eq('id', project_id).execute()
            
            return Response({
                'success': True,
                'assignment': assignment,
                'message': 'Project assigned successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    @action(detail=False, methods=['get'])
    def get_team_assignments(self, request):
        """Get all team assignments for a company"""
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            company_id = user_response.user.id
            
            # Get all team assignments
            assignments_response = self.supabase.table('team_assignments').select('*').eq('company_id', company_id).execute()
            
            if not assignments_response.data:
                return Response([])
            
            assignments = []
            for assignment in assignments_response.data:
                # Get project details
                project_response = self.supabase.table('projects').select('title').eq('id', assignment['project_id']).execute()
                project_title = project_response.data[0]['title'] if project_response.data else 'Unknown Project'
                
                # Get team members
                members_response = self.supabase.table('team_assignment_members').select('*').eq('team_assignment_id', assignment['id']).execute()
                
                members = []
                for member in members_response.data if members_response.data else []:
                    # Get developer info
                    dev_response = self.supabase.auth.admin.get_user_by_id(member['developer_id'])
                    if dev_response.user:
                        user_meta = dev_response.user.user_metadata or {}
                        members.append({
                            'developer_id': member['developer_id'],
                            'name': f"{user_meta.get('first_name', '')} {user_meta.get('last_name', '')}".strip() or 'Developer',
                            'email': dev_response.user.email,
                            'figma_submitted': member.get('figma_submitted', False),
                            'project_submitted': member.get('project_submitted', False),
                            'figma_url': member.get('figma_url'),
                            'submission_links': member.get('submission_links', {})
                        })
                
                assignments.append({
                    **assignment,
                    'project_title': project_title,
                    'members': members
                })
            
            return Response(assignments)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def get_developer_team_assignments(self, request):
        """Get all team assignments for a developer"""
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            developer_id = user_response.user.id
            
            # Get team memberships
            members_response = self.supabase.table('team_assignment_members').select('*').eq('developer_id', developer_id).execute()
            
            if not members_response.data:
                return Response([])
            
            assignments = []
            for member in members_response.data:
                # Get team assignment
                assignment_response = self.supabase.table('team_assignments').select('*').eq('id', member['team_assignment_id']).execute()
                if not assignment_response.data:
                    continue
                
                assignment = assignment_response.data[0]
                
                # Get project details
                project_response = self.supabase.table('projects').select('title, company_id').eq('id', assignment['project_id']).execute()
                if not project_response.data:
                    continue
                
                project = project_response.data[0]
                
                # Get company info
                company_response = self.supabase.auth.admin.get_user_by_id(project['company_id'])
                company_name = 'Unknown Company'
                if company_response.user:
                    user_meta = company_response.user.user_metadata or {}
                    company_name = user_meta.get('company_name', 'Unknown Company')
                
                # Get all team members
                all_members_response = self.supabase.table('team_assignment_members').select('*').eq('team_assignment_id', assignment['id']).execute()
                team_members = []
                for tm in all_members_response.data if all_members_response.data else []:
                    dev_response = self.supabase.auth.admin.get_user_by_id(tm['developer_id'])
                    if dev_response.user:
                        user_meta = dev_response.user.user_metadata or {}
                        team_members.append({
                            'developer_id': tm['developer_id'],
                            'name': f"{user_meta.get('first_name', '')} {user_meta.get('last_name', '')}".strip() or 'Developer',
                            'email': dev_response.user.email
                        })
                
                assignments.append({
                    **assignment,
                    'project_title': project['title'],
                    'company_name': company_name,
                    'team_members': team_members,
                    'my_figma_submitted': member.get('figma_submitted', False),
                    'my_project_submitted': member.get('project_submitted', False),
                    'my_figma_url': member.get('figma_url'),
                    'my_submission_links': member.get('submission_links', {})
                })
            
            return Response(assignments)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def submit_figma(self, request, pk=None):
        """Developer submits Figma design"""
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            developer_id = user_response.user.id
            figma_url = request.data.get('figma_url', '')
            figma_images = request.data.get('figma_images', [])  # Array of image URLs
            
            if not figma_url and not figma_images:
                return Response({'error': 'Either figma_url or figma_images is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update team member record
            update_data = {
                'figma_submitted': True,
                'figma_url': figma_url,
                'figma_images': figma_images,
                'figma_submitted_at': timezone.now().isoformat()
            }
            
            response = self.supabase.table('team_assignment_members').update(update_data).eq('team_assignment_id', pk).eq('developer_id', developer_id).execute()
            
            if not response.data:
                return Response({'error': 'Failed to submit Figma'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Send message to team chat
            chat_response = self.supabase.table('team_chats').select('id').eq('team_assignment_id', pk).execute()
            if chat_response.data:
                chat_id = chat_response.data[0]['id']
                message = "📐 Figma design submitted!"
                if figma_url:
                    message += f"\n🔗 Link: {figma_url}"
                if figma_images:
                    message += f"\n🖼️ {len(figma_images)} image(s) attached"
                
                message_data = {
                    'chat_id': chat_id,
                    'sender_id': developer_id,
                    'message': message,
                    'message_type': 'system',
                    'created_at': timezone.now().isoformat()
                }
                self.supabase.table('team_chat_messages').insert(message_data).execute()
            
            return Response({'success': True, 'message': 'Figma submitted successfully'})
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def submit_project(self, request, pk=None):
        """Developer submits final project"""
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            developer_id = user_response.user.id
            submission_links = request.data.get('submission_links', {})
            
            # submission_links should contain: {github, zip_file, documents: [pdf_urls], live_url, other}
            if not submission_links:
                return Response({'error': 'submission_links is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update team member record
            update_data = {
                'project_submitted': True,
                'submission_links': submission_links,
                'project_submitted_at': timezone.now().isoformat()
            }
            
            response = self.supabase.table('team_assignment_members').update(update_data).eq('team_assignment_id', pk).eq('developer_id', developer_id).execute()
            
            if not response.data:
                return Response({'error': 'Failed to submit project'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Send message to team chat
            chat_response = self.supabase.table('team_chats').select('id').eq('team_assignment_id', pk).execute()
            if chat_response.data:
                chat_id = chat_response.data[0]['id']
                message = "🚀 Project submitted for review!"
                if submission_links.get('github'):
                    message += f"\n💻 GitHub: {submission_links['github']}"
                if submission_links.get('zip_file'):
                    message += f"\n📦 ZIP file attached"
                if submission_links.get('documents'):
                    message += f"\n📄 {len(submission_links['documents'])} document(s) attached"
                if submission_links.get('live_url'):
                    message += f"\n🌐 Live: {submission_links['live_url']}"
                
                message_data = {
                    'chat_id': chat_id,
                    'sender_id': developer_id,
                    'message': message,
                    'message_type': 'system',
                    'created_at': timezone.now().isoformat()
                }
                self.supabase.table('team_chat_messages').insert(message_data).execute()
            
            return Response({'success': True, 'message': 'Project submitted successfully'})
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def get_team_chat(self, request, pk=None):
        """Get team chat messages"""
        try:
            # Get chat
            chat_response = self.supabase.table('team_chats').select('id').eq('team_assignment_id', pk).execute()
            if not chat_response.data:
                return Response({'messages': []})
            
            chat_id = chat_response.data[0]['id']
            
            # Get messages
            messages_response = self.supabase.table('team_chat_messages').select('*').eq('chat_id', chat_id).order('created_at').execute()
            
            messages = []
            for msg in messages_response.data if messages_response.data else []:
                # Get sender info
                sender_response = self.supabase.auth.admin.get_user_by_id(msg['sender_id'])
                sender_name = 'Unknown'
                if sender_response.user:
                    user_meta = sender_response.user.user_metadata or {}
                    sender_name = f"{user_meta.get('first_name', '')} {user_meta.get('last_name', '')}".strip() or sender_response.user.email
                
                messages.append({
                    **msg,
                    'sender_name': sender_name
                })
            
            return Response({'messages': messages})
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def send_team_message(self, request, pk=None):
        """Send message to team chat"""
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            sender_id = user_response.user.id
            message = request.data.get('message')
            
            if not message:
                return Response({'error': 'message is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get chat
            chat_response = self.supabase.table('team_chats').select('id').eq('team_assignment_id', pk).execute()
            if not chat_response.data:
                return Response({'error': 'Chat not found'}, status=status.HTTP_404_NOT_FOUND)
            
            chat_id = chat_response.data[0]['id']
            
            # Create message
            message_data = {
                'chat_id': chat_id,
                'sender_id': sender_id,
                'message': message,
                'message_type': 'text',
                'created_at': timezone.now().isoformat()
            }
            
            response = self.supabase.table('team_chat_messages').insert(message_data).execute()
            
            if not response.data:
                return Response({'error': 'Failed to send message'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({'success': True, 'message': response.data[0]})
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    @action(detail=True, methods=['post'])
    def update_deadlines(self, request, pk=None):
        """Company updates project deadlines"""
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            company_id = user_response.user.id
            figma_deadline = request.data.get('figma_deadline')
            submission_deadline = request.data.get('submission_deadline')
            
            if not figma_deadline or not submission_deadline:
                return Response({'error': 'Both deadlines are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify company owns this assignment
            assignment_response = self.supabase.table('team_assignments').select('*').eq('id', pk).eq('company_id', company_id).execute()
            if not assignment_response.data:
                return Response({'error': 'Assignment not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
            
            # Update deadlines
            from datetime import datetime
            update_data = {
                'figma_deadline': f"{figma_deadline}T23:59:59Z",
                'submission_deadline': f"{submission_deadline}T23:59:59Z"
            }
            
            response = self.supabase.table('team_assignments').update(update_data).eq('id', pk).execute()
            
            if not response.data:
                return Response({'error': 'Failed to update deadlines'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Send message to team chat
            chat_response = self.supabase.table('team_chats').select('id').eq('team_assignment_id', pk).execute()
            if chat_response.data:
                chat_id = chat_response.data[0]['id']
                message_data = {
                    'chat_id': chat_id,
                    'sender_id': company_id,
                    'message': f"Deadlines updated! Figma: {figma_deadline}, Final Submission: {submission_deadline}",
                    'message_type': 'system',
                    'created_at': timezone.now().isoformat()
                }
                self.supabase.table('team_chat_messages').insert(message_data).execute()
            
            return Response({'success': True, 'message': 'Deadlines updated successfully'})
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    @action(detail=True, methods=['post'])
    def update_deadlines(self, request, pk=None):
        """Company updates Figma or project deadlines"""
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            company_id = user_response.user.id
            
            # Get assignment and verify ownership
            assignment_response = self.supabase.table('team_assignments').select('*').eq('id', pk).eq('company_id', company_id).execute()
            if not assignment_response.data:
                return Response({'error': 'Assignment not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
            
            figma_deadline = request.data.get('figma_deadline')
            submission_deadline = request.data.get('submission_deadline')
            
            update_data = {
                'deadline_updated_by': company_id,
                'deadline_updated_at': timezone.now().isoformat()
            }
            
            if figma_deadline:
                update_data['figma_deadline'] = figma_deadline
            if submission_deadline:
                update_data['submission_deadline'] = submission_deadline
            
            response = self.supabase.table('team_assignments').update(update_data).eq('id', pk).execute()
            
            if not response.data:
                return Response({'error': 'Failed to update deadlines'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Send notification to team chat
            chat_response = self.supabase.table('team_chats').select('id').eq('team_assignment_id', pk).execute()
            if chat_response.data:
                chat_id = chat_response.data[0]['id']
                message = "⏰ Deadlines have been updated by the company."
                if figma_deadline:
                    from datetime import datetime
                    deadline_date = datetime.fromisoformat(figma_deadline.replace('Z', '+00:00'))
                    message += f"\n📐 New Figma deadline: {deadline_date.strftime('%B %d, %Y')}"
                if submission_deadline:
                    from datetime import datetime
                    deadline_date = datetime.fromisoformat(submission_deadline.replace('Z', '+00:00'))
                    message += f"\n🚀 New project deadline: {deadline_date.strftime('%B %d, %Y')}"
                
                message_data = {
                    'chat_id': chat_id,
                    'sender_id': company_id,
                    'message': message,
                    'message_type': 'system',
                    'created_at': timezone.now().isoformat()
                }
                self.supabase.table('team_chat_messages').insert(message_data).execute()
            
            return Response({'success': True, 'assignment': response.data[0]})
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    @action(detail=True, methods=['post'])
    def share_file(self, request, pk=None):
        """Share a file with the team"""
        try:
            assignment_id = pk
            file_data = request.data
            
            # Get authorization
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            user_id = user_response.user.id
            
            # Create shared file record
            shared_file = {
                'assignment_id': assignment_id,
                'shared_by': user_id,
                'file_name': file_data.get('name'),
                'file_url': file_data.get('url'),
                'file_size': file_data.get('size'),
                'file_type': file_data.get('type'),
                'shared_at': timezone.now().isoformat()
            }
            
            response = self.supabase.table('shared_files').insert(shared_file).execute()
            
            return Response({
                'success': True,
                'file': response.data[0] if response.data else shared_file
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def share_link(self, request, pk=None):
        """Share a link with the team"""
        try:
            assignment_id = pk
            link_data = request.data
            
            # Get authorization
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            user_id = user_response.user.id
            
            # Create shared link record
            shared_link = {
                'assignment_id': assignment_id,
                'shared_by': user_id,
                'link_url': link_data.get('url'),
                'link_description': link_data.get('description', ''),
                'shared_at': timezone.now().isoformat()
            }
            
            response = self.supabase.table('shared_links').insert(shared_link).execute()
            
            return Response({
                'success': True,
                'link': response.data[0] if response.data else shared_link
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def get_shared_files(self, request, pk=None):
        """Get all shared files and links for a team assignment"""
        try:
            assignment_id = pk
            
            # Get shared files
            files_response = self.supabase.table('shared_files').select('*').eq('assignment_id', assignment_id).order('shared_at', desc=True).execute()
            
            # Get shared links
            links_response = self.supabase.table('shared_links').select('*').eq('assignment_id', assignment_id).order('shared_at', desc=True).execute()
            
            return Response({
                'files': files_response.data if files_response.data else [],
                'links': links_response.data if links_response.data else []
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def delete_shared_item(self, request, pk=None):
        """Delete a shared file or link"""
        try:
            item_id = request.data.get('item_id')
            item_type = request.data.get('item_type')  # 'file' or 'link'
            
            if not item_id or not item_type:
                return Response({'error': 'item_id and item_type are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get authorization
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Delete from appropriate table
            table_name = 'shared_files' if item_type == 'file' else 'shared_links'
            self.supabase.table(table_name).delete().eq('id', item_id).execute()
            
            return Response({'success': True})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
