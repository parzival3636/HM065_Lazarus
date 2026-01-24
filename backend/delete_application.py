"""Quick script to delete an application so you can test again"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from accounts.supabase_client import get_supabase_client
import sys

if len(sys.argv) < 3:
    print("Usage: python delete_application.py <project_id> <developer_id>")
    sys.exit(1)

project_id = sys.argv[1]
developer_id = sys.argv[2]

supabase = get_supabase_client()

# Delete application
result = supabase.table('project_applications').delete().eq('project_id', project_id).eq('developer_id', developer_id).execute()

print(f"✅ Deleted application for project {project_id} and developer {developer_id}")
print(f"   Deleted {len(result.data)} record(s)")
