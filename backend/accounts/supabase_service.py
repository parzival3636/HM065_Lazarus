from .supabase_client import get_supabase_client
from django.http import JsonResponse
import json

class SupabaseService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def get_user_profile(self, user_id, user_type):
        """Get user profile from Supabase"""
        try:
            if user_type == 'developer':
                response = self.supabase.table('developer_profiles').select('*').eq('user_id', user_id).execute()
                if response.data:
                    return response.data[0]
            elif user_type == 'company':
                response = self.supabase.table('company_profiles').select('*').eq('user_id', user_id).execute()
                if response.data:
                    return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    def create_project(self, project_data):
        """Create project in Supabase"""
        try:
            response = self.supabase.table('projects').insert(project_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating project: {e}")
            return None
    
    def get_projects(self, filters=None):
        """Get projects from Supabase"""
        try:
            query = self.supabase.table('projects').select('*')
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error getting projects: {e}")
            return []
    
    def create_application(self, application_data):
        """Create project application in Supabase"""
        try:
            response = self.supabase.table('project_applications').insert(application_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating application: {e}")
            return None
    
    def get_applications(self, filters=None):
        """Get project applications from Supabase"""
        try:
            query = self.supabase.table('project_applications').select('*')
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error getting applications: {e}")
            return []
    
    def create_assignment(self, assignment_data):
        """Create project assignment in Supabase"""
        try:
            response = self.supabase.table('project_assignments').insert(assignment_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating assignment: {e}")
            return None
    
    def get_assignments(self, filters=None):
        """Get project assignments from Supabase"""
        try:
            query = self.supabase.table('project_assignments').select('*')
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error getting assignments: {e}")
            return []
    
    def create_chat(self, chat_data):
        """Create project chat in Supabase"""
        try:
            response = self.supabase.table('project_chats').insert(chat_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating chat: {e}")
            return None
    
    def create_message(self, message_data):
        """Create chat message in Supabase"""
        try:
            response = self.supabase.table('chat_messages').insert(message_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating message: {e}")
            return None
    
    def get_messages(self, chat_id):
        """Get chat messages from Supabase"""
        try:
            response = self.supabase.table('chat_messages').select('*').eq('chat_id', chat_id).order('created_at').execute()
            return response.data
        except Exception as e:
            print(f"Error getting messages: {e}")
            return []
    
    def create_figma_submission(self, submission_data):
        """Create Figma submission in Supabase"""
        try:
            response = self.supabase.table('figma_design_submissions').insert(submission_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating figma submission: {e}")
            return None
    
    def create_project_submission(self, submission_data):
        """Create project submission in Supabase"""
        try:
            response = self.supabase.table('project_submissions').insert(submission_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating project submission: {e}")
            return None
    
    def update_record(self, table, record_id, data):
        """Update record in Supabase"""
        try:
            response = self.supabase.table(table).update(data).eq('id', record_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating record: {e}")
            return None