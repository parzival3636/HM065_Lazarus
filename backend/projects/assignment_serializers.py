from rest_framework import serializers
from projects.models import (
    ProjectAssignment, ProjectChat, ChatMessage,
    FigmaDesignSubmission, ProjectSubmission
)
from accounts.models import DeveloperProfile
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_type = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'sender', 'sender_name', 'sender_type', 'message',
            'message_type', 'attachments', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at']
    
    def get_sender_type(self, obj):
        # Determine if sender is company or developer
        if hasattr(obj.chat.assignment.project, 'company'):
            if obj.sender == obj.chat.assignment.project.company:
                return 'company'
        if obj.sender == obj.chat.assignment.developer:
            return 'developer'
        return 'system'


class ProjectChatSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProjectChat
        fields = ['id', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FigmaDesignSubmissionSerializer(serializers.ModelSerializer):
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = FigmaDesignSubmission
        fields = [
            'id', 'figma_url', 'description', 'submitted_at', 'days_remaining'
        ]
        read_only_fields = ['id', 'submitted_at']
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        deadline = obj.assignment.figma_deadline
        remaining = (deadline - timezone.now()).days
        return max(0, remaining)


class ProjectSubmissionSerializer(serializers.ModelSerializer):
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectSubmission
        fields = [
            'id', 'description', 'documentation_links', 'github_links',
            'project_links', 'additional_links', 'submitted_at',
            'approved', 'company_feedback', 'reviewed_at', 'days_remaining'
        ]
        read_only_fields = ['id', 'submitted_at', 'approved', 'reviewed_at']
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        deadline = obj.assignment.submission_deadline
        remaining = (deadline - timezone.now()).days
        return max(0, remaining)


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    developer_name = serializers.CharField(source='developer.get_full_name', read_only=True)
    company_name = serializers.CharField(source='project.company.get_full_name', read_only=True)
    
    figma_days_remaining = serializers.SerializerMethodField()
    submission_days_remaining = serializers.SerializerMethodField()
    
    chat = ProjectChatSerializer(read_only=True)
    figma_submission = FigmaDesignSubmissionSerializer(read_only=True)
    submission = ProjectSubmissionSerializer(read_only=True)
    
    class Meta:
        model = ProjectAssignment
        fields = [
            'id', 'project', 'project_title', 'developer', 'developer_name',
            'company_name', 'assigned_at', 'figma_deadline', 'submission_deadline',
            'figma_submitted', 'project_submitted', 'figma_days_remaining',
            'submission_days_remaining', 'chat', 'figma_submission', 'submission'
        ]
        read_only_fields = [
            'id', 'assigned_at', 'figma_deadline', 'submission_deadline',
            'figma_submitted', 'project_submitted'
        ]
    
    def get_figma_days_remaining(self, obj):
        from django.utils import timezone
        remaining = (obj.figma_deadline - timezone.now()).days
        return max(0, remaining)
    
    def get_submission_days_remaining(self, obj):
        from django.utils import timezone
        remaining = (obj.submission_deadline - timezone.now()).days
        return max(0, remaining)
