from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    USER_TYPES = (
        ('developer', 'Developer/Designer'),
        ('company', 'Company'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    phone = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class DeveloperProfile(models.Model):
    EXPERIENCE_LEVELS = (
        ('entry', 'Entry Level (0-2 years)'),
        ('intermediate', 'Intermediate (2-5 years)'),
        ('expert', 'Expert (5+ years)'),
    )
    
    AVAILABILITY_CHOICES = (
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract Only'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    skills = models.TextField()
    experience = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS)
    years_experience = models.IntegerField(default=0)
    
    # Portfolio Links
    portfolio = models.URLField(blank=True)
    github = models.URLField(blank=True)
    dribbble = models.URLField(blank=True)
    behance = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    
    education = models.CharField(max_length=200, blank=True)
    languages = models.CharField(max_length=200, blank=True)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='full-time')
    
    # Performance Metrics
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.IntegerField(default=0)
    total_projects = models.IntegerField(default=0)
    completed_projects = models.IntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Past projects for ML matching
    past_projects = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"

class PortfolioProject(models.Model):
    """Developer portfolio projects for showcasing work."""
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    tech_stack = models.JSONField(default=list)
    images = models.JSONField(default=list)  # Array of image URLs
    video_url = models.URLField(blank=True)
    project_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.developer.get_full_name()}"


class CompanyProfile(models.Model):
    COMPANY_SIZES = (
        ('1-10', '1-10 employees'),
        ('11-50', '11-50 employees'),
        ('51-200', '51-200 employees'),
        ('200+', '200+ employees'),
    )
    
    COMPANY_TYPES = (
        ('startup', 'Startup'),
        ('enterprise', 'Enterprise'),
        ('agency', 'Agency'),
        ('nonprofit', 'Non-profit'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZES)
    industry = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    description = models.TextField()
    founded_year = models.IntegerField(null=True, blank=True)
    company_type = models.CharField(max_length=20, choices=COMPANY_TYPES, default='startup')
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_documents = models.JSONField(default=list, blank=True)
    
    # Performance Metrics
    total_projects_posted = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    average_project_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    def __str__(self):
        return self.company_name