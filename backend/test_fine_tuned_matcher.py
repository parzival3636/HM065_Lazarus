#!/usr/bin/env python
"""
Test script for the fine-tuned SBERT matcher integration.
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from projects.fine_tuned_matcher import get_fine_tuned_matcher
from projects.models import Project, ProjectApplication
from accounts.models import DeveloperProfile

def test_fine_tuned_matcher():
    """Test the fine-tuned matcher integration."""
    
    print("🧪 Testing Fine-tuned SBERT Matcher Integration")
    print("=" * 50)
    
    # 1. Test matcher initialization
    print("\n1. Loading Fine-tuned Matcher...")
    try:
        matcher = get_fine_tuned_matcher()
        print("   ✓ Fine-tuned matcher loaded successfully!")
        print(f"   ✓ Model loaded: {matcher.model is not None}")
        print(f"   ✓ Custom scorer loaded: {matcher.scorer is not None}")
    except Exception as e:
        print(f"   ✗ Error loading matcher: {e}")
        return False
    
    # 2. Test with existing projects (if any)
    print("\n2. Testing with existing data...")
    projects = Project.objects.all()[:3]  # Test with first 3 projects
    
    if not projects.exists():
        print("   ⚠ No projects found in database")
        print("   💡 Create some test projects and applications to test matching")
        return True
    
    for project in projects:
        print(f"\n   Testing project: {project.title}")
        
        # Get applications for this project
        applications = ProjectApplication.objects.filter(project=project)
        
        if not applications.exists():
            print("     ⚠ No applications found for this project")
            continue
        
        try:
            # Test ranking
            ranked = matcher.rank_freelancers(project, top_n=3)
            print(f"     ✓ Ranked {len(ranked)} freelancers")
            
            for i, freelancer in enumerate(ranked, 1):
                print(f"       {i}. {freelancer['developer_name']}: {freelancer['overall_score']}/100")
                print(f"          Method: {freelancer.get('matching_method', 'unknown')}")
            
            # Test detailed analysis for first application
            if applications.exists():
                first_app = applications.first()
                analysis = matcher.get_match_details(first_app)
                
                if analysis:
                    print(f"     ✓ Detailed analysis generated")
                    print(f"       Overall score: {analysis['overall_score']}/100")
                    print(f"       Matching method: {analysis.get('matching_method', 'unknown')}")
                    print(f"       Matching skills: {len(analysis['matching_skills'])}")
                    print(f"       Missing skills: {len(analysis['missing_skills'])}")
                else:
                    print("     ⚠ Could not generate detailed analysis")
                    
        except Exception as e:
            print(f"     ✗ Error testing project: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("✅ Fine-tuned matcher integration test completed!")
    print("\n💡 Next steps:")
    print("   1. Place your fine-tuned model in: backend/fine_tuned_model/")
    print("   2. Place your scorer.py in: backend/")
    print("   3. Test with real project data")
    
    return True

if __name__ == "__main__":
    test_fine_tuned_matcher()