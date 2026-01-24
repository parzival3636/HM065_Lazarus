"""
Test script to check Figma shortlist data in Supabase
Run with: python test_figma_data.py
"""

from accounts.supabase_service import get_supabase_client

def test_figma_data():
    supabase = get_supabase_client()
    
    print("=" * 60)
    print("TESTING FIGMA SHORTLIST DATA")
    print("=" * 60)
    
    # Check figma_shortlists table
    print("\n1. Checking figma_shortlists table...")
    try:
        shortlists = supabase.table('figma_shortlists').select('*').execute()
        print(f"   Found {len(shortlists.data)} shortlist entries")
        
        if shortlists.data:
            for i, shortlist in enumerate(shortlists.data, 1):
                print(f"\n   Entry {i}:")
                print(f"   - ID: {shortlist['id']}")
                print(f"   - Project ID: {shortlist['project_id']}")
                print(f"   - Developer ID: {shortlist['developer_id']}")
                print(f"   - Application ID: {shortlist['application_id']}")
                print(f"   - Figma URL: {shortlist.get('figma_url', 'Not submitted')}")
                print(f"   - Deadline: {shortlist['figma_deadline']}")
        else:
            print("   ⚠️ No shortlist entries found!")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check projects
    print("\n2. Checking projects...")
    try:
        projects = supabase.table('projects').select('id, title, company_id, status').execute()
        print(f"   Found {len(projects.data)} projects")
        
        if projects.data:
            for project in projects.data[:3]:
                print(f"   - {project['title']} (Status: {project['status']})")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check project_applications
    print("\n3. Checking project_applications...")
    try:
        apps = supabase.table('project_applications').select('id, project_id, developer_id, status').execute()
        print(f"   Found {len(apps.data)} applications")
        
        figma_pending = [a for a in apps.data if a['status'] == 'figma_pending']
        figma_submitted = [a for a in apps.data if a['status'] == 'figma_submitted']
        
        print(f"   - figma_pending: {len(figma_pending)}")
        print(f"   - figma_submitted: {len(figma_submitted)}")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test the API endpoint logic
    print("\n4. Testing API endpoint logic...")
    try:
        # Get a developer ID from shortlists
        if shortlists.data:
            test_dev_id = shortlists.data[0]['developer_id']
            print(f"   Testing with developer ID: {test_dev_id}")
            
            # Query like the API does
            dev_shortlists = supabase.table('figma_shortlists').select('*').eq('developer_id', test_dev_id).execute()
            print(f"   Found {len(dev_shortlists.data)} shortlists for this developer")
            
            if dev_shortlists.data:
                for shortlist in dev_shortlists.data:
                    # Get project
                    project = supabase.table('projects').select('*').eq('id', shortlist['project_id']).execute()
                    if project.data:
                        print(f"   ✅ Project found: {project.data[0]['title']}")
                    else:
                        print(f"   ❌ Project NOT found for ID: {shortlist['project_id']}")
        else:
            print("   ⚠️ No shortlists to test with")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    test_figma_data()
