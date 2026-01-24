"""Clear applications for a specific project"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from accounts.supabase_client import get_supabase_client

project_id = 'fd2d57cd-54ac-4784-aa32-a42c4089893c'

supabase = get_supabase_client()

# Get applications for this project
result = supabase.table('project_applications').select('*').eq('project_id', project_id).execute()

print(f"\n📋 Found {len(result.data)} application(s) for project {project_id}")

for app in result.data:
    print(f"\n🗑️  Deleting application:")
    print(f"   ID: {app['id']}")
    print(f"   Developer: {app['developer_id']}")
    print(f"   Status: {app['status']}")
    print(f"   Match Score: {app.get('match_score', 'N/A')}")
    
    # Delete it
    delete_result = supabase.table('project_applications').delete().eq('id', app['id']).execute()
    print(f"   ✅ Deleted!")

print(f"\n✅ All applications cleared. You can now apply again.")
