from .supabase_service import get_supabase_client
import json

def suggest_optimal_team(project_id, required_skills, budget, team_size=3):
    """Generate optimal team combinations for a project"""
    supabase = get_supabase_client()
    
    # Get available developers
    developers = supabase.table('developer_profiles').select('*').execute()
    
    # Score developers based on skills match
    scored_devs = []
    for dev in developers.data:
        skills = dev.get('skills', '').split(',')
        skill_match = len(set(required_skills) & set(skills)) / len(required_skills)
        
        scored_devs.append({
            'id': dev['id'],
            'name': dev.get('full_name', ''),
            'skills': skills,
            'hourly_rate': dev.get('hourly_rate', 50),
            'rating': dev.get('rating', 0),
            'score': skill_match * 0.6 + (dev.get('rating', 0) / 5) * 0.4
        })
    
    # Sort by score and create team combinations
    scored_devs.sort(key=lambda x: x['score'], reverse=True)
    
    # Generate top team combination
    team = scored_devs[:team_size]
    total_cost = sum(dev['hourly_rate'] for dev in team) * 40  # 40 hours estimate
    
    return {
        'team': team,
        'total_cost': total_cost,
        'skills_coverage': list(set().union(*[dev['skills'] for dev in team])),
        'team_score': sum(dev['score'] for dev in team) / len(team)
    }