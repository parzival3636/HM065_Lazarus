import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from projects.simple_fine_tuned_matcher import SimpleMatcher

m = SimpleMatcher()
result = m.calculate_match_score(
    {'title': 'Test', 'description': 'Test project', 'tech_stack': ['Python'], 'budget_min': 1000, 'budget_max': 5000},
    {'cover_letter': 'Test', 'proposed_rate': 2000, 'developer_profile': {'skills': 'Python', 'years_experience': 3, 'rating': 4.5, 'total_projects': 10, 'success_rate': 90}}
)

print(f"Overall Score: {result['overall_score']} (type: {type(result['overall_score']).__name__})")
print(f"Skill Match: {result['component_scores']['skill_match']} (type: {type(result['component_scores']['skill_match']).__name__})")
print(f"\nConverting to integers:")
print(f"  int(round({result['overall_score']})) = {int(round(result['overall_score']))}")
print(f"  int(round({result['component_scores']['skill_match']})) = {int(round(result['component_scores']['skill_match']))}")
print("\n✅ Integer conversion works correctly!")
