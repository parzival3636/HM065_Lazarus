"""
Quick script to check Figma shortlist status and guide next steps.
Run this to see what's in the database and what needs to be done.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from accounts.supabase_service import get_supabase_client

def check_figma_status():
    print("\n" + "="*60)
    print("FIGMA SHORTLIST STATUS CHECK")
    print("="*60 + "\n")
    
    supabase = get_supabase_client()
    
    # Check figma_shortlists table
    print("1. Checking figma_shortlists table...")
    try:
        shortlists = supabase.table('figma_shortlists').select('*').execute()
        if shortlists.data:
            print(f"   ✅ Found {len(shortlists.data)} shortlist entries")
            for s in shortlists.data:
                print(f"      - Project: {s['project_id']}")
                print(f"        Developer: {s['developer_id']}")
                print(f"        Submitted: {bool(s.get('figma_url'))}")
        else:
            print("   ⚠️  No shortlist entries found (table is empty)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check projects
    print("\n2. Checking projects...")
    try:
        projects = supabase.table('projects').select('id, title, status, company_id').execute()
        if projects.data:
            print(f"   ✅ Found {len(projects.data)} projects")
            for p in projects.data[:3]:
                print(f"      - {p['title']} (Status: {p['status']})")
        else:
            print("   ⚠️  No projects found")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check applications
    print("\n3. Checking project applications...")
    try:
        applications = supabase.table('project_applications').select('id, project_id, developer_id, status, match_score').execute()
        if applications.data:
            print(f"   ✅ Found {len(applications.data)} applications")
            
            # Group by project
            by_project = {}
            for app in applications.data:
                pid = app['project_id']
                if pid not in by_project:
                    by_project[pid] = []
                by_project[pid].append(app)
            
            for pid, apps in list(by_project.items())[:3]:
                print(f"\n      Project {pid}:")
                print(f"      Total applications: {len(apps)}")
                pending = [a for a in apps if a['status'] == 'pending']
                print(f"      Pending applications: {len(pending)}")
                if pending:
                    sorted_apps = sorted(pending, key=lambda x: x.get('match_score', 0), reverse=True)[:3]
                    print(f"      Top 3 by score:")
                    for i, app in enumerate(sorted_apps, 1):
                        print(f"         {i}. Developer {app['developer_id'][:8]}... (Score: {app.get('match_score', 'N/A')})")
        else:
            print("   ⚠️  No applications found")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print("""
1. Make sure your current developer account has applied to a project
   - Go to Projects page and apply to a project
   
2. As a company user, go to the project's applications page
   - Click "Shortlist Top 3 for Figma" button
   - This will create shortlist entries for the top 3 applicants
   
3. The shortlisted developers will then see:
   - Alert banner on their dashboard
   - Entry in "Figma Submissions" page
   
4. Developers can submit their Figma designs
   
5. Company can review and optionally use AI evaluation
   
6. Company assigns project to the winner
""")
    print("="*60 + "\n")

if __name__ == '__main__':
    check_figma_status()
