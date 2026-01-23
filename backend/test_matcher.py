#!/usr/bin/env python
"""Test script to verify ML matcher is working"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from projects.matcher import get_matcher
from projects.models import Project, ProjectApplication
from accounts.models import DeveloperProfile
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("Testing ML Matcher Integration")
print("=" * 60)

# Test 1: Load matcher
print("\n1. Loading ML Matcher...")
try:
    matcher = get_matcher()
    print("   ✓ Matcher loaded successfully!")
except Exception as e:
    print(f"   ✗ Error loading matcher: {e}")
    exit(1)

# Test 2: Check models have new fields
print("\n2. Checking database models...")
try:
    # Check ProjectApplication fields
    app_fields = [f.name for f in ProjectApplication._meta.get_fields()]
    required_fields = ['match_score', 'skill_match_score', 'experience_fit_score', 
                      'portfolio_quality_score', 'matching_skills', 'missing_skills', 
                      'ai_reasoning', 'manual_override']
    
    for field in required_fields:
        if field in app_fields:
            print(f"   ✓ ProjectApplication.{field} exists")
        else:
            print(f"   ✗ ProjectApplication.{field} missing")
    
    # Check DeveloperProfile fields
    dev_fields = [f.name for f in DeveloperProfile._meta.get_fields()]
    if 'past_projects' in dev_fields:
        print(f"   ✓ DeveloperProfile.past_projects exists")
    else:
        print(f"   ✗ DeveloperProfile.past_projects missing")
        
except Exception as e:
    print(f"   ✗ Error checking models: {e}")

# Test 3: Check if we have any data
print("\n3. Checking database data...")
try:
    project_count = Project.objects.count()
    user_count = User.objects.count()
    app_count = ProjectApplication.objects.count()
    
    print(f"   - Projects: {project_count}")
    print(f"   - Users: {user_count}")
    print(f"   - Applications: {app_count}")
    
    if project_count > 0:
        print(f"   ✓ Sample project: {Project.objects.first().title}")
    
except Exception as e:
    print(f"   ✗ Error checking data: {e}")

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)
print("\nNext steps:")
print("1. Start the backend server: python manage.py runserver")
print("2. Test creating a project from company dashboard")
print("3. Test applying to a project from developer dashboard")
print("4. Check that ML scores are calculated automatically")
