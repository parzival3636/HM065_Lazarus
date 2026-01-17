"""
Utility functions for project and freelancer matching.
"""

from typing import List, Dict, Optional
from projects.models import Project, ProjectApplication
from projects.matcher import get_matcher


def get_top_freelancers(project_id: int, top_n: int = 5) -> List[Dict]:
    """
    Get top N ranked freelancers for a project.
    
    Args:
        project_id: ID of the project
        top_n: Number of top freelancers to return (default: 5)
    
    Returns:
        List of freelancer dicts with scores
    
    Raises:
        Project.DoesNotExist: If project not found
    """
    project = Project.objects.get(id=project_id)
    matcher = get_matcher()
    return matcher.rank_freelancers(project, top_n=top_n)


def analyze_application(application_id: int) -> Optional[Dict]:
    """
    Get detailed match analysis for an application.
    
    Args:
        application_id: ID of the application
    
    Returns:
        Dict with detailed analysis or None if error
    
    Raises:
        ProjectApplication.DoesNotExist: If application not found
    """
    application = ProjectApplication.objects.get(id=application_id)
    matcher = get_matcher()
    return matcher.get_match_details(application)


def shortlist_freelancer(application_id: int) -> bool:
    """
    Shortlist a freelancer for a project.
    
    Args:
        application_id: ID of the application
    
    Returns:
        True if successful, False otherwise
    """
    try:
        application = ProjectApplication.objects.get(id=application_id)
        application.status = 'shortlisted'
        application.save()
        return True
    except ProjectApplication.DoesNotExist:
        return False


def reject_freelancer(application_id: int) -> bool:
    """
    Reject a freelancer for a project.
    
    Args:
        application_id: ID of the application
    
    Returns:
        True if successful, False otherwise
    """
    try:
        application = ProjectApplication.objects.get(id=application_id)
        application.status = 'rejected'
        application.save()
        return True
    except ProjectApplication.DoesNotExist:
        return False


def get_freelancer_score_breakdown(application_id: int) -> Optional[Dict]:
    """
    Get detailed score breakdown for a freelancer application.
    
    Args:
        application_id: ID of the application
    
    Returns:
        Dict with component scores or None if error
    """
    try:
        analysis = analyze_application(application_id)
        if analysis:
            return {
                'overall_score': analysis['overall_score'],
                'component_scores': analysis['component_scores'],
                'skill_analysis': {
                    'matching': analysis['matching_skills'],
                    'missing': analysis['missing_skills'],
                    'extra': analysis['extra_skills'],
                }
            }
    except Exception as e:
        print(f"Error getting score breakdown: {e}")
    
    return None


def batch_rank_projects(project_ids: List[int], top_n: int = 5) -> Dict[int, List[Dict]]:
    """
    Rank freelancers for multiple projects.
    
    Args:
        project_ids: List of project IDs
        top_n: Number of top freelancers per project
    
    Returns:
        Dict mapping project_id to ranked freelancers
    """
    results = {}
    
    for project_id in project_ids:
        try:
            results[project_id] = get_top_freelancers(project_id, top_n=top_n)
        except Project.DoesNotExist:
            results[project_id] = []
        except Exception as e:
            print(f"Error ranking project {project_id}: {e}")
            results[project_id] = []
    
    return results


def get_freelancer_stats(application_id: int) -> Optional[Dict]:
    """
    Get freelancer statistics for an application.
    
    Args:
        application_id: ID of the application
    
    Returns:
        Dict with freelancer stats or None if error
    """
    try:
        application = ProjectApplication.objects.get(id=application_id)
        developer = application.developer.developerprofile
        
        return {
            'name': developer.user.get_full_name(),
            'title': developer.title,
            'years_experience': developer.years_experience,
            'rating': float(developer.rating),
            'total_projects': developer.total_projects,
            'completed_projects': developer.completed_projects,
            'success_rate': float(developer.success_rate),
            'total_reviews': developer.total_reviews,
            'hourly_rate': float(developer.hourly_rate) if developer.hourly_rate else None,
            'availability': developer.availability,
            'skills': developer.skills,
        }
    except Exception as e:
        print(f"Error getting freelancer stats: {e}")
    
    return None


def get_project_stats(project_id: int) -> Optional[Dict]:
    """
    Get project statistics.
    
    Args:
        project_id: ID of the project
    
    Returns:
        Dict with project stats or None if error
    """
    try:
        project = Project.objects.get(id=project_id)
        
        applications = project.applications.all()
        pending_apps = applications.filter(status='pending').count()
        shortlisted_apps = applications.filter(status='shortlisted').count()
        rejected_apps = applications.filter(status='rejected').count()
        
        return {
            'title': project.title,
            'category': project.category,
            'complexity': project.complexity,
            'tech_stack': project.tech_stack,
            'budget_min': float(project.budget_min) if project.budget_min else None,
            'budget_max': float(project.budget_max) if project.budget_max else None,
            'status': project.status,
            'total_applications': applications.count(),
            'pending_applications': pending_apps,
            'shortlisted_applications': shortlisted_apps,
            'rejected_applications': rejected_apps,
            'views_count': project.views_count,
            'created_at': project.created_at.isoformat(),
            'deadline': project.deadline.isoformat(),
        }
    except Exception as e:
        print(f"Error getting project stats: {e}")
    
    return None
