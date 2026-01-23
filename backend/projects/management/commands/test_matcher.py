"""
Management command to test the freelancer matcher.
Usage: python manage.py test_matcher --project_id <id>
"""

from django.core.management.base import BaseCommand
from projects.models import Project
from projects.matcher import get_matcher


class Command(BaseCommand):
    help = 'Test the freelancer matcher for a specific project'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--project_id',
            type=int,
            help='ID of the project to rank freelancers for'
        )
    
    def handle(self, *args, **options):
        project_id = options.get('project_id')
        
        if not project_id:
            self.stdout.write(self.style.ERROR('Please provide --project_id'))
            return
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Project with ID {project_id} not found'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'\n🔍 Ranking freelancers for project: {project.title}'))
        self.stdout.write(f'Project ID: {project.id}')
        self.stdout.write(f'Category: {project.category}')
        self.stdout.write(f'Tech Stack: {", ".join(project.tech_stack)}')
        self.stdout.write(f'Total Applications: {project.applications_count}\n')
        
        try:
            matcher = get_matcher()
            ranked = matcher.rank_freelancers(project, top_n=5)
            
            if not ranked:
                self.stdout.write(self.style.WARNING('No applications found for this project'))
                return
            
            self.stdout.write(self.style.SUCCESS(f'✅ Top {len(ranked)} Ranked Freelancers:\n'))
            
            for idx, freelancer in enumerate(ranked, 1):
                self.stdout.write(self.style.SUCCESS(f'\n{idx}. {freelancer["developer_name"]}'))
                self.stdout.write(f'   Title: {freelancer["developer_title"]}')
                self.stdout.write(f'   Overall Score: {freelancer["overall_score"]}/100')
                self.stdout.write(f'   Experience: {freelancer["years_experience"]} years')
                self.stdout.write(f'   Rating: {freelancer["rating"]}/5.0')
                self.stdout.write(f'   Success Rate: {freelancer["success_rate"]}%')
                self.stdout.write(f'   Proposed Rate: ${freelancer["proposed_rate"]}' if freelancer["proposed_rate"] else '   Proposed Rate: Not specified')
                
                scores = freelancer['component_scores']
                self.stdout.write(f'\n   Component Scores:')
                self.stdout.write(f'   - Skill Match: {scores["skill_match"]}%')
                self.stdout.write(f'   - Experience Fit: {scores["experience_fit"]}%')
                self.stdout.write(f'   - Portfolio Quality: {scores["portfolio_quality"]}%')
                self.stdout.write(f'   - Proposal Quality: {scores["proposal_quality"]}%')
                self.stdout.write(f'   - Rate Fit: {scores["rate_fit"]}%')
            
            self.stdout.write(self.style.SUCCESS('\n✅ Ranking complete!'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
