from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from datetime import timedelta
import json

from .supabase_service import ProjectSupabaseService
from accounts.supabase_client import get_supabase_client


class ProjectAssignmentViewSet(viewsets.ViewSet):
    """ViewSet for managing project assignments"""
    permission_classes = []
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ProjectSupabaseService()
        self.supabase = get_supabase_client()
    
    @action(detail=False, methods=['post'])
    def assign_project(self, request):
        """Assign a project to a developer from an application"""
        application_id = request.data.get('application_id')
        
        try:
            # Get application from Supabase
            app_response = self.supabase.table('project_applications').select('*').eq('id', application_id).execute()
            if not app_response.data:
                return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
            
            application = app_response.data[0]
            project_id = application['project_id']
            developer_id = application['developer_id']
            
            # Check if already assigned
            existing_response = self.supabase.table('project_assignments').select('id').eq('project_id', project_id).execute()
            if existing_response.data:
                return Response({'error': 'Project already assigned'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create assignment
            assignment_data = {
                'project_id': project_id,
                'developer_id': developer_id,
                'application_id': application_id
            }
            
            assignment = self.service.create_assignment(assignment_data)
            if not assignment:
                return Response({'error': 'Failed to create assignment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Create chat
            chat = self.service.create_chat(assignment['id'])
            
            # Get project info for congratulations message
            project_response = self.supabase.table('projects').select('title').eq('id', project_id).execute()
            project_title = project_response.data[0]['title'] if project_response.data else 'this project'
            
            # Create congratulations message
            self.service.create_message(
                assignment['id'],
                application['developer_id'],  # Use developer as sender for system message
                f"Congratulations! You have been selected for the project '{project_title}'. "
                f"Please submit your Figma designs within 1 week and the final project within 30 days.",
                'system'
            )
            
            # Update application status
            self.supabase.table('project_applications').update({'status': 'selected'}).eq('id', application_id).execute()
            
            # Update project status
            self.supabase.table('projects').update({'status': 'in_progress'}).eq('id', project_id).execute()
            
            return Response(assignment, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def chat(self, request, pk=None):
        """Get chat for an assignment"""
        try:
            # Get assignment from Supabase
            assignment_response = self.supabase.table('project_assignments').select('*').eq('id', pk).execute()
            if not assignment_response.data:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
            
            assignment = assignment_response.data[0]
            
            # Get project to verify user access
            project_response = self.supabase.table('projects').select('company_id').eq('id', assignment['project_id']).execute()
            if not project_response.data:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
            
            project = project_response.data[0]
            
            # Verify user is part of this assignment
            user_id = str(request.user.id) if request.user and request.user.id else None
            if user_id != project['company_id'] and user_id != assignment['developer_id']:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get chat messages
            messages = self.service.get_chat_messages(pk)
            return Response({'messages': messages})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in the chat"""
        try:
            # Get assignment from Supabase
            assignment_response = self.supabase.table('project_assignments').select('*').eq('id', pk).execute()
            if not assignment_response.data:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
            
            assignment = assignment_response.data[0]
            
            # Get project to verify user access
            project_response = self.supabase.table('projects').select('company_id').eq('id', assignment['project_id']).execute()
            if not project_response.data:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
            
            project = project_response.data[0]
            
            # Verify user is part of this assignment
            user_id = str(request.user.id) if request.user and request.user.id else None
            if user_id != project['company_id'] and user_id != assignment['developer_id']:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            message_text = request.data.get('message', '')
            attachments = request.data.get('attachments', [])
            
            # Create message
            message = self.service.create_message(pk, user_id, message_text, 'user')
            if not message:
                return Response({'error': 'Failed to create message'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response(message, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def submit_figma(self, request, pk=None):
        """Submit Figma designs"""
        try:
            # Get assignment from Supabase
            assignment_response = self.supabase.table('project_assignments').select('*').eq('id', pk).execute()
            if not assignment_response.data:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
            
            assignment = assignment_response.data[0]
            
            # Verify user is the developer
            user_id = str(request.user.id) if request.user and request.user.id else None
            if user_id != assignment['developer_id']:
                return Response({'error': 'Only the assigned developer can submit'}, status=status.HTTP_403_FORBIDDEN)
            
            # Check deadline
            from datetime import datetime
            figma_deadline = datetime.fromisoformat(assignment['figma_deadline'].replace('Z', '+00:00'))
            if datetime.now(figma_deadline.tzinfo) > figma_deadline:
                return Response({'error': 'Figma submission deadline has passed'}, status=status.HTTP_400_BAD_REQUEST)
            
            figma_url = request.data.get('figma_url')
            description = request.data.get('description', '')
            
            # Create submission
            submission = self.service.create_figma_submission(pk, figma_url, description)
            if not submission:
                return Response({'error': 'Failed to create submission'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Send system message
            self.service.create_message(pk, user_id, f"Figma designs submitted! URL: {figma_url}", 'system')
            
            return Response(submission, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def submit_project(self, request, pk=None):
        """Submit final project"""
        try:
            # Get assignment from Supabase
            assignment_response = self.supabase.table('project_assignments').select('*').eq('id', pk).execute()
            if not assignment_response.data:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
            
            assignment = assignment_response.data[0]
            
            # Verify user is the developer
            user_id = str(request.user.id) if request.user and request.user.id else None
            if user_id != assignment['developer_id']:
                return Response({'error': 'Only the assigned developer can submit'}, status=status.HTTP_403_FORBIDDEN)
            
            # Check deadline
            from datetime import datetime
            submission_deadline = datetime.fromisoformat(assignment['submission_deadline'].replace('Z', '+00:00'))
            if datetime.now(submission_deadline.tzinfo) > submission_deadline:
                return Response({'error': 'Project submission deadline has passed'}, status=status.HTTP_400_BAD_REQUEST)
            
            description = request.data.get('description', '')
            documentation_links = request.data.get('documentation_links', [])
            github_links = request.data.get('github_links', [])
            project_links = request.data.get('project_links', [])
            additional_links = request.data.get('additional_links', [])
            
            # Create submission
            submission = self.service.create_project_submission(
                pk, description, documentation_links, github_links, project_links, additional_links
            )
            if not submission:
                return Response({'error': 'Failed to create submission'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Send system message
            self.service.create_message(pk, user_id, "Project submitted for review!", 'system')
            
            return Response(submission, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def review_submission(self, request, pk=None):
        """Company reviews project submission"""
        try:
            # Get assignment from Supabase
            assignment_response = self.supabase.table('project_assignments').select('*').eq('id', pk).execute()
            if not assignment_response.data:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
            
            assignment = assignment_response.data[0]
            
            # Get project to verify user access
            project_response = self.supabase.table('projects').select('company_id').eq('id', assignment['project_id']).execute()
            if not project_response.data:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
            
            project = project_response.data[0]
            
            # Verify user is the company
            user_id = str(request.user.id) if request.user and request.user.id else None
            if user_id != project['company_id']:
                return Response({'error': 'Only the company can review submissions'}, status=status.HTTP_403_FORBIDDEN)
            
            approved = request.data.get('approved')
            feedback = request.data.get('feedback', '')
            
            # Update submission
            submission = self.service.review_submission(pk, approved, feedback)
            if not submission:
                return Response({'error': 'Failed to review submission'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Update project status
            new_status = 'completed' if approved else 'review'
            self.supabase.table('projects').update({'status': new_status}).eq('id', assignment['project_id']).execute()
            
            # Send system message
            status_text = "approved" if approved else "needs revisions"
            self.service.create_message(pk, user_id, f"Project {status_text}. Feedback: {feedback}", 'system')
            
            return Response(submission)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def developer_assignments(self, request):
        """Get all assignments for a developer"""
        try:
            # Get authorization header
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            
            # Verify token and get user
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            developer_id = user_response.user.id
            
            # Get assignments for this developer
            assignments = self.service.get_developer_assignments(developer_id)
            
            # Process assignments to add calculated fields
            processed_assignments = []
            for assignment in assignments:
                # Calculate days remaining
                from datetime import datetime, timezone
                now = datetime.now(timezone.utc)
                
                try:
                    # Parse datetime strings and ensure they're timezone-aware
                    figma_deadline_str = assignment['figma_deadline']
                    submission_deadline_str = assignment['submission_deadline']
                    
                    # Remove 'Z' and add timezone info if needed
                    if figma_deadline_str.endswith('Z'):
                        figma_deadline_str = figma_deadline_str[:-1] + '+00:00'
                    if submission_deadline_str.endswith('Z'):
                        submission_deadline_str = submission_deadline_str[:-1] + '+00:00'
                    
                    figma_deadline = datetime.fromisoformat(figma_deadline_str)
                    submission_deadline = datetime.fromisoformat(submission_deadline_str)
                    
                    # Ensure both datetimes are timezone-aware
                    if figma_deadline.tzinfo is None:
                        figma_deadline = figma_deadline.replace(tzinfo=timezone.utc)
                    if submission_deadline.tzinfo is None:
                        submission_deadline = submission_deadline.replace(tzinfo=timezone.utc)
                    
                    figma_days = max(0, (figma_deadline - now).days)
                    submission_days = max(0, (submission_deadline - now).days)
                    
                except Exception as e:
                    print(f"Error calculating days for assignment {assignment.get('id')}: {e}")
                    figma_days = 0
                    submission_days = 0
                
                processed_assignments.append({
                    **assignment,
                    'figma_days_remaining': figma_days,
                    'submission_days_remaining': submission_days
                })
            
            return Response(processed_assignments)
        except Exception as e:
            print(f"Error getting developer assignments: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def company_assignments(self, request):
        """Get all assignments for a company"""
        try:
            # Get authorization header
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if not auth_header:
                return Response({'error': 'No authorization token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.replace('Bearer ', '')
            
            # Verify token and get user
            user_response = self.supabase.auth.get_user(token)
            if not user_response.user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            company_id = user_response.user.id
            
            # Get assignments for this company
            assignments = self.service.get_company_assignments(company_id)
            return Response(assignments)
        except Exception as e:
            print(f"Error getting company assignments: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
