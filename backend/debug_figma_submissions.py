"""
Debug script to check Figma submissions data
Run this to see what's in the database
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from accounts.supabase_service import get_supabase_client

def debug_figma_data():
    print("=" * 60)
    print("FIGMA SUBMISSIONS DEBUG")
    print("=" * 60)
    
    supabase = get_supabase_client()
    
    # Check figma_shortlists table
    print("\n1. Checking figma_shortlists table...")
    try:
        shortlists = supabase.table('figma_shortlists').select('*').execute()
        
        if shortlists.data:
            print(f"   ✅ Found {len(shortlists.data)} shortlist entries")
            for sl in shortlists.data:
                print(f"\n   Shortlist ID: {sl['id']}")
                print(f"   Project ID: {sl['project_id']}")
                print(f"   Developer ID: {sl['developer_id']}")
                print(f"   Figma URL: {sl.get('figma_url', 'None')}")
                print(f"   Design Images: {sl.get('design_images', 'None')}")
                print(f"   Submitted: {sl.get('submitted_at', 'Not yet')}")
                print(f"   CLIP Score: {sl.get('clip_score', 'Not evaluated')}")
        else:
            print("   ⚠️  No shortlist entries found")
            print("   → Create shortlists by clicking 'Shortlist Top 3' on a project")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check projects table
    print("\n2. Checking projects table...")
    try:
        projects = supabase.table('projects').select('id, title, company_id, status').execute()
        
        if projects.data:
            print(f"   ✅ Found {len(projects.data)} projects")
            for proj in projects.data[:5]:  # Show first 5
                print(f"   - {proj['title']} (ID: {proj['id']}, Status: {proj['status']})")
        else:
            print("   ⚠️  No projects found")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check project_applications table
    print("\n3. Checking project_applications table...")
    try:
        apps = supabase.table('project_applications').select('id, project_id, developer_id, status').execute()
        
        if apps.data:
            print(f"   ✅ Found {len(apps.data)} applications")
            
            # Group by status
            status_counts = {}
            for app in apps.data:
                status = app['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            print("   Status breakdown:")
            for status, count in status_counts.items():
                print(f"   - {status}: {count}")
        else:
            print("   ⚠️  No applications found")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check for design_images column
    print("\n4. Checking if design_images column exists...")
    try:
        test = supabase.table('figma_shortlists').select('design_images').limit(1).execute()
        print("   ✅ design_images column exists")
    except Exception as e:
        print(f"   ❌ design_images column missing: {e}")
        print("   → Run FIGMA_IMAGE_UPLOAD_MIGRATION.sql in Supabase")
    
    # Check storage bucket
    print("\n5. Checking storage bucket...")
    try:
        buckets = supabase.storage.list_buckets()
        bucket_names = [b['name'] for b in buckets]
        
        if 'design-images' in bucket_names:
            print("   ✅ design-images bucket exists")
            
            # Try to list files
            try:
                files = supabase.storage.from_('design-images').list()
                print(f"   📁 Files in bucket: {len(files) if files else 0}")
            except:
                print("   📁 Bucket is empty or inaccessible")
        else:
            print("   ❌ design-images bucket NOT found")
            print("   → Run FIGMA_IMAGE_UPLOAD_MIGRATION.sql in Supabase")
    except Exception as e:
        print(f"   ⚠️  Could not check storage: {e}")
    
    print("\n" + "=" * 60)
    print("DEBUG COMPLETE")
    print("=" * 60)
    
    # Recommendations
    print("\n📋 RECOMMENDATIONS:")
    
    if not shortlists.data:
        print("1. Create a shortlist:")
        print("   - Go to a project with 3+ applications")
        print("   - Click 'Shortlist Top 3 for Figma Review'")
    
    print("\n2. Check if backend server is running:")
    print("   python manage.py runserver")
    
    print("\n3. Check browser console for errors (F12)")
    
    print("\n4. Verify you're logged in as the correct user")

if __name__ == '__main__':
    debug_figma_data()
