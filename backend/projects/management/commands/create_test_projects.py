"""
Management command to create test projects for development.
Usage: python manage.py create_test_projects
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from projects.models import Project
from datetime import datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test projects for development'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating test projects...'))
        
        # Get or create a test company user
        company_user, created = User.objects.get_or_create(
            email='company@test.com',
            defaults={
                'username': 'company@test.com',
                'first_name': 'Test',
                'last_name': 'Company',
                'user_type': 'company',
                'is_active': True,
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created company user: {company_user.email}'))
        else:
            self.stdout.write(self.style.WARNING(f'Company user already exists: {company_user.email}'))
        
        # Create test projects
        test_projects = [
            {
                'title': 'Build E-commerce Platform',
                'description': 'Build a modern e-commerce platform with React frontend, Node.js backend, MongoDB database, payment integration with Stripe, user authentication, product catalog, shopping cart, and order management system.',
                'category': 'fullstack',
                'tech_stack': ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
                'complexity': 'complex',
                'budget_min': 2000,
                'budget_max': 5000,
                'estimated_duration': '4 weeks',
                'status': 'open',
            },
            {
                'title': 'Mobile App UI/UX Design',
                'description': 'Design user interface for a fitness tracking mobile application with workout plans, progress tracking, social features, and integration with health APIs.',
                'category': 'design',
                'tech_stack': ['Figma', 'Adobe XD', 'Prototyping'],
                'complexity': 'medium',
                'budget_min': 1500,
                'budget_max': 3000,
                'estimated_duration': '2 weeks',
                'status': 'open',
            },
            {
                'title': 'Machine Learning Model Development',
                'description': 'Build a machine learning model for sentiment analysis of customer reviews using Python, TensorFlow, and deploy as REST API.',
                'category': 'ai_ml',
                'tech_stack': ['Python', 'TensorFlow', 'Flask', 'Docker', 'AWS'],
                'complexity': 'complex',
                'budget_min': 3000,
                'budget_max': 6000,
                'estimated_duration': '6 weeks',
                'status': 'open',
            },
            {
                'title': 'React Dashboard Development',
                'description': 'Create a responsive admin dashboard with real-time data visualization, user management, and reporting features.',
                'category': 'frontend',
                'tech_stack': ['React', 'Redux', 'Chart.js', 'Material-UI'],
                'complexity': 'medium',
                'budget_min': 1000,
                'budget_max': 2500,
                'estimated_duration': '3 weeks',
                'status': 'open',
            },
            {
                'title': 'API Development for Mobile App',
                'description': 'Develop RESTful API endpoints for a mobile application with authentication, database design, and documentation.',
                'category': 'backend',
                'tech_stack': ['Node.js', 'Express', 'PostgreSQL', 'JWT'],
                'complexity': 'medium',
                'budget_min': 1500,
                'budget_max': 3500,
                'estimated_duration': '3 weeks',
                'status': 'open',
            },
        ]
        
        created_count = 0
        for project_data in test_projects:
            project, created = Project.objects.get_or_create(
                title=project_data['title'],
                company=company_user,
                defaults={
                    'description': project_data['description'],
                    'category': project_data['category'],
                    'tech_stack': project_data['tech_stack'],
                    'complexity': project_data['complexity'],
                    'budget_min': project_data['budget_min'],
                    'budget_max': project_data['budget_max'],
                    'estimated_duration': project_data['estimated_duration'],
                    'status': project_data['status'],
                    'start_date': datetime.now().date(),
                    'deadline': (datetime.now() + timedelta(days=30)).date(),
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created project: {project.title}'))
                created_count += 1
            else:
                self.stdout.write(self.style.WARNING(f'✗ Project already exists: {project.title}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Created {created_count} new projects'))
        
        # Show all projects
        all_projects = Project.objects.all()
        self.stdout.write(self.style.SUCCESS(f'\nTotal projects in database: {all_projects.count()}'))
        for project in all_projects:
            self.stdout.write(f'  - {project.title} (status: {project.status})')
