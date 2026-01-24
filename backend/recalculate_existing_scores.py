"""
Recalculate match scores for all existing applications using the fine-tuned model
Run this script to update scores for applications created before the fix
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from accounts.supabase_client import get_supabase_client
from projects.simple_fine_tuned_matcher import SimpleMatcher

def recalculate_all_scores():
    """Recalculate scores for all existing applications"""
    
    print("\n" + "="*70)
    print("🔄 RECALCULATING SCORES FOR EXISTING APPLICATIONS")
    print("="*70)
    
    supabase = get_supabase_client()
    matcher = SimpleMatcher()
    
    # Get all applications
    print("\n📥 Fetching all applications...")
    try:
        applications_response = supabase.table('project_applications').select('*').execute()
        applications = applications_response.data
        
        if not applications:
            print("❌ No applications found")
            return
        
        print(f"✅ Found {len(applications)} applications")
        
    except Exception as e:
        print(f"❌ Error fetching applications: {e}")
        return
    
    # Process each application
    updated_count = 0
    error_count = 0
    
    for i, application in enumerate(applications, 1):
        app_id = application['id']
        project_id = application['project_id']
        developer_id = application['developer_id']
        
        print(f"\n[{i}/{len(applications)}] Processing application {app_id}...")
        
        try:
            # Get project data
            project_response = supabase.table('projects').select('*').eq('id', project_id).execute()
            if not project_response.data:
                print(f"  ⚠️ Project {project_id} not found, skipping")
                error_count += 1
                continue
            
            project = project_response.data[0]
            
            # Get developer profile
            profile_response = supabase.table('developer_profiles').select('*').eq('user_id', developer_id).execute()
            developer_profile = profile_response.data[0] if profile_response.data else {}
            
            # Prepare application data for scoring
            app_data = {
                'id': app_id,
                'developer_id': developer_id,
                'cover_letter': application.get('cover_letter', ''),
                'proposed_rate': application.get('proposed_rate'),
                'estimated_duration': application.get('estimated_duration'),
                'developer_profile': developer_profile
            }
            
            # Calculate new scores
            match_result = matcher.calculate_match_score(project, app_data)
            
            old_score = application.get('match_score', 'N/A')
            new_score = match_result['overall_score']
            
            # Update application with new scores (convert to integers)
            update_data = {
                'match_score': int(round(new_score)),
                'skill_match_score': int(round(match_result['component_scores']['skill_match'])),
                'experience_fit_score': int(round(match_result['component_scores']['experience_fit'])),
                'portfolio_quality_score': int(round(match_result['component_scores']['portfolio_quality'])),
                'ai_reasoning': match_result['reasoning']
            }
            
            supabase.table('project_applications').update(update_data).eq('id', app_id).execute()
            
            print(f"  ✅ Updated: {old_score}% → {new_score}%")
            print(f"     Method: {match_result['method']}")
            updated_count += 1
            
        except Exception as e:
            print(f"  ❌ Error processing application {app_id}: {e}")
            error_count += 1
            continue
    
    # Summary
    print("\n" + "="*70)
    print("📊 RECALCULATION SUMMARY")
    print("="*70)
    print(f"Total applications: {len(applications)}")
    print(f"✅ Successfully updated: {updated_count}")
    print(f"❌ Errors: {error_count}")
    print("="*70)
    
    if updated_count > 0:
        print("\n🎉 Scores have been recalculated!")
        print("💡 Refresh your application views to see the updated scores")
    else:
        print("\n⚠️ No applications were updated")

def recalculate_project_scores(project_id):
    """Recalculate scores for applications of a specific project"""
    
    print("\n" + "="*70)
    print(f"🔄 RECALCULATING SCORES FOR PROJECT {project_id}")
    print("="*70)
    
    supabase = get_supabase_client()
    matcher = SimpleMatcher()
    
    # Get project
    try:
        project_response = supabase.table('projects').select('*').eq('id', project_id).execute()
        if not project_response.data:
            print(f"❌ Project {project_id} not found")
            return
        
        project = project_response.data[0]
        print(f"✅ Project: {project['title']}")
        
    except Exception as e:
        print(f"❌ Error fetching project: {e}")
        return
    
    # Get applications for this project
    try:
        applications_response = supabase.table('project_applications').select('*').eq('project_id', project_id).execute()
        applications = applications_response.data
        
        if not applications:
            print("❌ No applications found for this project")
            return
        
        print(f"✅ Found {len(applications)} applications")
        
    except Exception as e:
        print(f"❌ Error fetching applications: {e}")
        return
    
    # Process each application
    updated_count = 0
    
    for i, application in enumerate(applications, 1):
        app_id = application['id']
        developer_id = application['developer_id']
        
        print(f"\n[{i}/{len(applications)}] Processing application {app_id}...")
        
        try:
            # Get developer profile
            profile_response = supabase.table('developer_profiles').select('*').eq('user_id', developer_id).execute()
            developer_profile = profile_response.data[0] if profile_response.data else {}
            
            # Prepare application data for scoring
            app_data = {
                'id': app_id,
                'developer_id': developer_id,
                'cover_letter': application.get('cover_letter', ''),
                'proposed_rate': application.get('proposed_rate'),
                'estimated_duration': application.get('estimated_duration'),
                'developer_profile': developer_profile
            }
            
            # Calculate new scores
            match_result = matcher.calculate_match_score(project, app_data)
            
            old_score = application.get('match_score', 'N/A')
            new_score = match_result['overall_score']
            
            # Update application with new scores (convert to integers)
            update_data = {
                'match_score': int(round(new_score)),
                'skill_match_score': int(round(match_result['component_scores']['skill_match'])),
                'experience_fit_score': int(round(match_result['component_scores']['experience_fit'])),
                'portfolio_quality_score': int(round(match_result['component_scores']['portfolio_quality'])),
                'ai_reasoning': match_result['reasoning']
            }
            
            supabase.table('project_applications').update(update_data).eq('id', app_id).execute()
            
            print(f"  ✅ Updated: {old_score}% → {new_score}%")
            updated_count += 1
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            continue
    
    print("\n" + "="*70)
    print(f"✅ Updated {updated_count}/{len(applications)} applications")
    print("="*70)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Recalculate for specific project
        project_id = sys.argv[1]
        recalculate_project_scores(project_id)
    else:
        # Recalculate all
        print("\n💡 Usage:")
        print("  Recalculate all:           python recalculate_existing_scores.py")
        print("  Recalculate one project:   python recalculate_existing_scores.py <project_id>")
        print()
        
        response = input("Recalculate scores for ALL applications? (yes/no): ")
        if response.lower() in ['yes', 'y']:
            recalculate_all_scores()
        else:
            print("❌ Cancelled")
