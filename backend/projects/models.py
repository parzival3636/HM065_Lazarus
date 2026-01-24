from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Project(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('open', 'Open for Applications'),
        ('shortlisting', 'Shortlisting'),
        ('in_progress', 'In Progress'),
        ('review', 'Under Review'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    CATEGORY_CHOICES = (
        ('web', 'Web Development'),
        ('mobile', 'Mobile Development'),
        ('design', 'UI/UX Design'),
        ('backend', 'Backend Development'),
        ('frontend', 'Frontend Development'),
        ('fullstack', 'Full Stack Development'),
        ('devops', 'DevOps'),
        ('ai_ml', 'AI/Machine Learning'),
        ('blockchain', 'Blockchain'),
        ('game', 'Game Development'),
        ('marketing', 'Digital Marketing'),
        ('writing', 'Content Writing'),
        ('other', 'Other'),
    )
    
    COMPLEXITY_CHOICES = (
        ('simple', 'Simple'),
        ('medium', 'Medium'),
        ('complex', 'Complex'),
        ('very_complex', 'Very Complex'),
    )
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    tech_stack = models.JSONField(default=list)
    complexity = models.CharField(max_length=20, choices=COMPLEXITY_CHOICES)
    
    # Timeline
    start_date = models.DateField()
    deadline = models.DateField()
    estimated_duration = models.CharField(max_length=100, blank=True)
    submission_deadline = models.DateField(null=True, blank=True)  # Final submission deadline
    
    # Budget
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_hidden = models.BooleanField(default=False)
    
    # Deliverables
    deliverables = models.JSONField(default=list)
    reference_files = models.JSONField(default=list, blank=True)
    
    # Tags and categorization
    tags = models.JSONField(default=list, blank=True)
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    views_count = models.IntegerField(default=0)
    applications_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class ProjectApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('shortlisted', 'Shortlisted'),
        ('figma_pending', 'Figma Submission Pending'),
        ('figma_submitted', 'Figma Submitted'),
        ('rejected', 'Rejected'),
        ('selected', 'Selected'),
    )
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='applications')
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField()
    proposed_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_duration = models.CharField(max_length=100)
    portfolio_links = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    
    # ML Matching scores
    match_score = models.IntegerField(null=True, blank=True)
    skill_match_score = models.IntegerField(null=True, blank=True)
    experience_fit_score = models.IntegerField(null=True, blank=True)
    portfolio_quality_score = models.IntegerField(null=True, blank=True)
    matching_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    ai_reasoning = models.TextField(blank=True)
    manual_override = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('project', 'developer')


class FigmaShortlist(models.Model):
    """Shortlist phase for top 3 applicants to submit Figma designs"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='figma_shortlists')
    application = models.OneToOneField(ProjectApplication, on_delete=models.CASCADE, related_name='figma_shortlist')
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='figma_shortlists')
    
    # Shortlist details
    shortlisted_at = models.DateTimeField(auto_now_add=True)
    figma_deadline = models.DateTimeField()  # Deadline for Figma submission
    
    # Figma submission
    figma_url = models.URLField(blank=True, null=True)
    figma_description = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    # OpenCLIP evaluation
    clip_score = models.FloatField(null=True, blank=True)  # Similarity score from OpenCLIP
    clip_rank = models.IntegerField(null=True, blank=True)  # Rank among shortlisted (1, 2, 3)
    evaluated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-clip_score']
    
    def save(self, *args, **kwargs):
        if not self.figma_deadline:
            self.figma_deadline = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Figma Shortlist - {self.project.title} - {self.developer.email}"


class ProjectAssignment(models.Model):
    """When a company assigns a project to a developer"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='assignment')
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_projects')
    application = models.OneToOneField(ProjectApplication, on_delete=models.CASCADE, related_name='assignment')
    
    # Timelines
    assigned_at = models.DateTimeField(auto_now_add=True)
    figma_deadline = models.DateTimeField()  # 1 week from assignment
    submission_deadline = models.DateTimeField()  # Final submission deadline
    
    # Status
    figma_submitted = models.BooleanField(default=False)
    figma_submitted_at = models.DateTimeField(null=True, blank=True)
    project_submitted = models.BooleanField(default=False)
    project_submitted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.figma_deadline:
            self.figma_deadline = timezone.now() + timedelta(days=7)
        if not self.submission_deadline:
            self.submission_deadline = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.project.title} - {self.developer.get_full_name()}"


class ProjectChat(models.Model):
    """Chat between company and developer for assigned project"""
    assignment = models.OneToOneField(ProjectAssignment, on_delete=models.CASCADE, related_name='chat')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Chat for {self.assignment.project.title}"


class ChatMessage(models.Model):
    """Individual messages in project chat"""
    chat = models.ForeignKey(ProjectChat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    
    # File attachments
    attachments = models.JSONField(default=list, blank=True)  # List of file URLs
    
    # Message type
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('system', 'System'),  # Automated messages like "Congratulations..."
        ('file', 'File'),
    )
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.get_full_name()}"


class FigmaDesignSubmission(models.Model):
    """Figma design submission (1 week deadline)"""
    assignment = models.OneToOneField(ProjectAssignment, on_delete=models.CASCADE, related_name='figma_submission')
    developer = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Design details
    figma_url = models.URLField()
    description = models.TextField(blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Figma Design - {self.assignment.project.title}"


class ProjectSubmission(models.Model):
    """Final project submission"""
    assignment = models.OneToOneField(ProjectAssignment, on_delete=models.CASCADE, related_name='submission')
    developer = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Submission content
    description = models.TextField()  # Rich text content
    documentation_links = models.JSONField(default=list)  # PDF links
    github_links = models.JSONField(default=list)  # GitHub repo links
    project_links = models.JSONField(default=list)  # Live project links
    additional_links = models.JSONField(default=list)  # Any other links
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    # Company review
    approved = models.BooleanField(null=True, blank=True)  # None = pending, True = approved, False = rejected
    company_feedback = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Submission - {self.assignment.project.title}"


class SubmissionFeedback(models.Model):
    """Feedback and rating from company to developer after project completion"""
    RATING_CHOICES = (
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    )
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='feedbacks')
    submission = models.ForeignKey(ProjectSubmission, on_delete=models.CASCADE, related_name='feedback')
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_feedback')
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_feedback')
    
    # Overall rating
    rating = models.IntegerField(choices=RATING_CHOICES)
    feedback_text = models.TextField()
    
    # Detailed ratings
    communication_rating = models.IntegerField(choices=RATING_CHOICES)
    quality_rating = models.IntegerField(choices=RATING_CHOICES)
    timeliness_rating = models.IntegerField(choices=RATING_CHOICES)
    professionalism_rating = models.IntegerField(choices=RATING_CHOICES)
    
    # Notification status
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback for {self.developer.email} - {self.project.title}"


class RejectionNotification(models.Model):
    """Automatic rejection notifications sent to non-selected applicants"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='rejection_notifications')
    application = models.OneToOneField(ProjectApplication, on_delete=models.CASCADE, related_name='rejection_notification')
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rejection_notifications')
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"Rejection notification for {self.developer.email} - {self.project.title}"