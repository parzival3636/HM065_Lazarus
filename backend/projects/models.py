from django.db import models
from django.contrib.auth import get_user_model

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
    tech_stack = models.JSONField(default=list)  # List of technologies
    complexity = models.CharField(max_length=20, choices=COMPLEXITY_CHOICES)
    
    # Timeline
    start_date = models.DateField()
    deadline = models.DateField()
    estimated_duration = models.CharField(max_length=100, blank=True)
    
    # Budget
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_hidden = models.BooleanField(default=False)
    
    # Deliverables
    deliverables = models.JSONField(default=list)  # List of required deliverables
    reference_files = models.JSONField(default=list, blank=True)  # File URLs
    
    # Tags and categorization
    tags = models.JSONField(default=list, blank=True)  # Additional tags
    
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