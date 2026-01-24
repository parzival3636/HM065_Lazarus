from .supabase_client import get_supabase_client

def create_team(company_id, team_name, description=""):
    """Create a new team"""
    supabase = get_supabase_client()
    
    team_data = {
        'company_id': company_id,
        'team_name': team_name,
        'description': description,
        'members': [],
        'total_cost': 0.0,
        'combined_score': 0.0,
        'skills_covered': [],
        'status': 'active'
    }
    
    response = supabase.table('project_teams').insert(team_data).execute()
    return response.data[0] if response.data else None

def get_company_teams(company_id):
    """Get all teams for a company"""
    supabase = get_supabase_client()
    
    teams_response = supabase.table('project_teams').select('*').eq('company_id', company_id).execute()
    
    if teams_response.data:
        teams = []
        for team in teams_response.data:
            # Get team members
            members_response = supabase.table('team_members').select('*').eq('team_id', team['id']).execute()
            
            members_data = []
            if members_response.data:
                for member in members_response.data:
                    # Get developer info
                    dev_response = supabase.auth.admin.get_user_by_id(member['developer_id'])
                    if dev_response.user:
                        user_meta = dev_response.user.user_metadata or {}
                        name = f"{user_meta.get('first_name', '')} {user_meta.get('last_name', '')}".strip()
                        
                        members_data.append({
                            'id': member['developer_id'],
                            'name': name or 'Developer',
                            'role': member['role'],
                            'added_at': member['added_at']
                        })
            
            team['members_data'] = members_data
            teams.append(team)
        
        return teams
    
    return []

def add_member_to_team(team_id, developer_id, role="Developer"):
    """Add a developer to a team"""
    supabase = get_supabase_client()
    
    # Check if already in team
    existing = supabase.table('team_members').select('id').eq('team_id', team_id).eq('developer_id', developer_id).execute()
    if existing.data:
        return None  # Already in team
    
    member_data = {
        'team_id': team_id,
        'developer_id': developer_id,
        'role': role
    }
    
    response = supabase.table('team_members').insert(member_data).execute()
    return response.data[0] if response.data else None