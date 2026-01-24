"""
Test script to verify Figma shortlist fetching works
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from accounts.supabase_service import get_supabase_client

def test_fetch():
    print("=" * 60)
    print("TESTING FIGMA SHORTLIST FETCH")
    print("=" * 60)
    
    supabase = get_supabase_client()
    
    # Get all shortlists
    print("\n1. Fetching all shortlists...")
    shortlists = supabase.table('figma_shortlists').select('*').execute()
    
    if not shortlists.data:
        print("   ❌ No shortlists found")
        print("   → Create a shortlist first")
        return
    
    print(f"   ✅ Found {len(shortlists.data)} shortlists")
    
    # For each shortlist, get the project
    for sl in shortlists.data:
        print(f"\n2. Testing shortlist ID: {sl['id']}")
        print(f"   Project ID: {sl['project_id']}")
        
        # Get project
        project = supabase.table('projects').select('*').eq('id', sl['project_id']).execute()
        
        if project.data:
            proj = project.data[0]
            print(f"   ✅ Project found: {proj['title']}")
            print(f"   Company ID: {proj['company_id']}")
            print(f"   Company ID type: {type(proj['company_id'])}")
            
            # Get shortlist for this project
            print(f"\n3. Fetching shortlist via API logic...")
            shortlist_response = supabase.table('figma_shortlists').select('*').eq('project_id', sl['project_id']).execute()
            
            if shortlist_response.data:
                print(f"   ✅ Found {len(shortlist_response.data)} entries")
                for entry in shortlist_response.data:
                    print(f"   - Developer ID: {entry['developer_id']}")
                    print(f"     Figma URL: {entry.get('figma_url', 'None')}")
                    print(f"     Design Images: {len(entry.get('design_images', []))} images")
                    print(f"     Submitted: {entry.get('submitted_at', 'Not yet')}")
            else:
                print(f"   ❌ No shortlist data returned")
        else:
            print(f"   ❌ Project not found")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    
    print("\n📋 NEXT STEPS:")
    print("1. Restart Django server: python manage.py runserver")
    print("2. Check Django terminal for detailed logs")
    print("3. Refresh company dashboard")
    print("4. Check browser console for frontend logs")

if __name__ == '__main__':
    test_fetch()
