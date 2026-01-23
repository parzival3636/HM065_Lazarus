from accounts.supabase_client import get_supabase_client
from datetime import datetime, timedelta
import uuid

class ProjectSupabaseService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def create_project(self, project_data):
        """Create project in Supabase"""
        try:
            response = self.supabase.table('projects').insert(project_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating project: {e}")
            return None
    
    def get_projects(self, filters=None):
        """Get projects from Supabase with company info"""
        try:
            # Join with auth.users to get company info
            query = self.supabase.table('projects').select('''
                *,
                company:company_id (
                    raw_user_meta_data
                )
            ''')
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error getting projects: {e}")
            return []
    
    def get_company_projects(self, company_id):
        """Get projects for a specific company"""
        try:
            response = self.supabase.table('projects').select('*').eq('company_id', company_id).execute()
            return response.data
        except Exception as e:
            print(f"Error getting company projects: {e}")
            return []
    
    def create_application(self, application_data):
        """Create project application"""
        try:
            response = self.supabase.table('project_applications').insert(application_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating application: {e}")
            return None
    
    def get_project_applications(self, project_id):
        """Get applications for a project with developer info"""
        try:
            # Get applications with developer profile info
            response = self.supabase.table('project_applications').select('''
                *,
                developer:developer_id (
                    raw_user_meta_data
                )
            ''').eq('project_id', project_id).execute()
            
            # Get developer profiles for each application
            applications = response.data
            for app in applications:
                if app['developer_id']:
                    profile_response = self.supabase.table('developer_profiles').select('*').eq('user_id', app['developer_id']).execute()
                    if profile_response.data:
                        app['developer_profile'] = profile_response.data[0]
            
            return applications
        except Exception as e:
            print(f"Error getting project applications: {e}")
            return []
    
    def create_assignment(self, assignment_data):
        """Create project assignment"""
        try:
            # Set deadlines
            now = datetime.now()
            assignment_data['figma_deadline'] = (now + timedelta(days=7)).isoformat()
            assignment_data['submission_deadline'] = (now + timedelta(days=30)).isoformat()
            
            response = self.supabase.table('project_assignments').insert(assignment_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating assignment: {e}")
            return None
    
    def get_developer_assignments(self, developer_id):
        """Get assignments for a developer"""
        try:
            response = self.supabase.table('project_assignments').select('''
                *,
                project:project_id (
                    title,
                    company_id
                )
            ''').eq('developer_id', developer_id).execute()
            
            # Get company info for each assignment
            assignments = response.data
            for assignment in assignments:
                if assignment['project'] and assignment['project']['company_id']:
                    company_response = self.supabase.auth.admin.get_user_by_id(assignment['project']['company_id'])
                    if company_response.user:
                        assignment['company_name'] = company_response.user.user_metadata.get('first_name', 'Company')
                        assignment['project_title'] = assignment['project']['title']
            
            return assignments
        except Exception as e:
            print(f"Error getting developer assignments: {e}")
            return []
    
    def get_company_assignments(self, company_id):
        """Get assignments for a company"""
        try:
            # Get assignments for projects owned by this company
            response = self.supabase.table('project_assignments').select('''
                *,
                project:project_id!inner (
                    title,
                    company_id
                ),
                developer:developer_id (
                    raw_user_meta_data
                )
            ''').eq('project.company_id', company_id).execute()
            
            # Get developer info for each assignment
            assignments = response.data
            for assignment in assignments:
                if assignment['developer_id']:
                    dev_response = self.supabase.auth.admin.get_user_by_id(assignment['developer_id'])
                    if dev_response.user:
                        assignment['developer_name'] = f"{dev_response.user.user_metadata.get('first_name', '')} {dev_response.user.user_metadata.get('last_name', '')}"
                        assignment['project_title'] = assignment['project']['title']
            
            return assignments
        except Exception as e:
            print(f"Error getting company assignments: {e}")
            return []
    
    def create_chat(self, assignment_id):
        """Create chat for assignment"""
        try:
            chat_data = {'assignment_id': assignment_id}
            response = self.supabase.table('project_chats').insert(chat_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating chat: {e}")
            return None
    
    def get_chat_messages(self, assignment_id):
        """Get chat messages for assignment"""
        try:
            # First get the chat
            chat_response = self.supabase.table('project_chats').select('id').eq('assignment_id', assignment_id).execute()
            if not chat_response.data:
                return []
            
            chat_id = chat_response.data[0]['id']
            
            # Get messages
            response = self.supabase.table('chat_messages').select('*').eq('chat_id', chat_id).order('created_at').execute()
            return response.data
        except Exception as e:
            print(f"Error getting chat messages: {e}")
            return []
    
    def create_message(self, assignment_id, sender_id, message, message_type='user'):
        """Create chat message"""
        try:
            # Get chat ID
            chat_response = self.supabase.table('project_chats').select('id').eq('assignment_id', assignment_id).execute()
            if not chat_response.data:
                return None
            
            chat_id = chat_response.data[0]['id']
            
            message_data = {
                'chat_id': chat_id,
                'sender_id': sender_id,
                'message': message,
                'message_type': message_type
            }
            
            response = self.supabase.table('chat_messages').insert(message_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating message: {e}")
            return None
    
    def create_figma_submission(self, assignment_id, figma_url, description):
        """Create Figma submission"""
        try:
            submission_data = {
                'assignment_id': assignment_id,
                'figma_url': figma_url,
                'description': description
            }
            
            response = self.supabase.table('figma_design_submissions').insert(submission_data).execute()
            
            # Update assignment
            self.supabase.table('project_assignments').update({'figma_submitted': True}).eq('id', assignment_id).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating figma submission: {e}")
            return None
    
    def create_project_submission(self, assignment_id, description, documentation_links, github_links, project_links, additional_links):
        """Create project submission"""
        try:
            submission_data = {
                'assignment_id': assignment_id,
                'description': description,
                'documentation_links': documentation_links,
                'github_links': github_links,
                'project_links': project_links,
                'additional_links': additional_links
            }
            
            response = self.supabase.table('project_submissions').insert(submission_data).execute()
            
            # Update assignment
            self.supabase.table('project_assignments').update({'project_submitted': True}).eq('id', assignment_id).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating project submission: {e}")
            return None
    
    def review_submission(self, assignment_id, approved, feedback):
        """Review project submission"""
        try:
            # Update submission
            response = self.supabase.table('project_submissions').update({
                'approved': approved,
                'company_feedback': feedback,
                'reviewed_at': datetime.now().isoformat()
            }).eq('assignment_id', assignment_id).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error reviewing submission: {e}")
            return None