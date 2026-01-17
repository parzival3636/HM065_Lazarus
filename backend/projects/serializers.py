"""
Serializers for Project and ProjectApplication models.
"""

from rest_framework import serializers
from projects.models import Project, ProjectApplication
from accounts.models import DeveloperProfile


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""
    company_name = serializers.CharField(source='company.get_full_name', read_only=True)
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'category', 'tech_stack',
            'complexity', 'start_date', 'deadline', 'estimated_duration',
            'budget_min', 'budget_max', 'budget_hidden', 'deliverables',
            'tags', 'status', 'views_count', 'applications_count',
            'company', 'company_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'views_count', 'applications_count', 'created_at', 'updated_at']
    
    def get_applications_count(self, obj):
        """Get count of pending applications."""
        return obj.applications.filter(status='pending').count()


class DeveloperProfileSerializer(serializers.ModelSerializer):
    """Serializer for DeveloperProfile model."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = DeveloperProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'title', 'bio',
            'hourly_rate', 'skills', 'experience', 'years_experience',
            'portfolio', 'github', 'linkedin', 'education', 'languages',
            'availability', 'rating', 'total_reviews', 'total_projects',
            'completed_projects', 'success_rate'
        ]
        read_only_fields = ['id', 'user', 'rating', 'total_reviews', 'total_projects', 'completed_projects', 'success_rate']


class ProjectApplicationSerializer(serializers.ModelSerializer):
    """Serializer for ProjectApplication model."""
    project_title = serializers.CharField(source='project.title', read_only=True)
    developer_name = serializers.CharField(source='developer.get_full_name', read_only=True)
    developer_profile = DeveloperProfileSerializer(source='developer.developerprofile', read_only=True)
    
    class Meta:
        model = ProjectApplication
        fields = [
            'id', 'project', 'project_title', 'developer', 'developer_name',
            'developer_profile', 'cover_letter', 'proposed_rate',
            'estimated_duration', 'portfolio_links', 'status', 'applied_at'
        ]
        read_only_fields = ['id', 'developer', 'applied_at']
