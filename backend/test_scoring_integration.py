"""
Test script to verify the fine-tuned matcher integration with Supabase data
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from projects.simple_fine_tuned_matcher import SimpleMatcher

def test_scoring():
    """Test the scoring with sample data"""
    
    print("\n" + "="*60)
    print("🧪 TESTING FINE-TUNED MATCHER INTEGRATION")
    print("="*60)
    
    # Initialize matcher
    matcher = SimpleMatcher()
    
    # Sample project data
    project_data = {
        'title': 'E-commerce Website Development',
        'description': 'Build a modern e-commerce platform with React and Node.js',
        'tech_stack': ['React', 'Node.js', 'MongoDB', 'Express'],
        'budget_min': 5000,
        'budget_max': 10000,
        'category': 'Web Development',
        'complexity': 'intermediate'
    }
    
    # Sample developer profile 1 - Good match
    developer_profile_1 = {
        'title': 'Full Stack Developer',
        'bio': 'Experienced in building e-commerce platforms with React and Node.js',
        'skills': 'React, Node.js, MongoDB, Express, JavaScript, TypeScript',
        'years_experience': 5,
        'rating': 4.8,
        'total_projects': 25,
        'success_rate': 95
    }
    
    # Sample application 1
    application_data_1 = {
        'cover_letter': 'I have extensive experience building e-commerce platforms. I have worked on similar projects using React and Node.js. I can deliver a high-quality solution within your timeline and budget.',
        'proposed_rate': 7000,
        'developer_profile': developer_profile_1
    }
    
    # Sample developer profile 2 - Moderate match
    developer_profile_2 = {
        'title': 'Frontend Developer',
        'bio': 'Specialized in React development',
        'skills': 'React, JavaScript, HTML, CSS, Vue.js',
        'years_experience': 2,
        'rating': 4.2,
        'total_projects': 8,
        'success_rate': 85
    }
    
    # Sample application 2
    application_data_2 = {
        'cover_letter': 'I can help with the frontend development using React.',
        'proposed_rate': 6000,
        'developer_profile': developer_profile_2
    }
    
    # Sample developer profile 3 - Poor match
    developer_profile_3 = {
        'title': 'Mobile App Developer',
        'bio': 'Expert in iOS and Android development',
        'skills': 'Swift, Kotlin, Java, Flutter',
        'years_experience': 3,
        'rating': 4.5,
        'total_projects': 15,
        'success_rate': 90
    }
    
    # Sample application 3
    application_data_3 = {
        'cover_letter': 'I am interested in this project.',
        'proposed_rate': 12000,
        'developer_profile': developer_profile_3
    }
    
    # Test scoring
    print("\n📊 Testing Application 1 (Expected: High Score)")
    print("-" * 60)
    result_1 = matcher.calculate_match_score(project_data, application_data_1)
    print(f"Overall Score: {result_1['overall_score']}%")
    print(f"Method: {result_1['method']}")
    print(f"Component Scores:")
    for component, score in result_1['component_scores'].items():
        print(f"  - {component}: {score:.1f}%")
    print(f"Reasoning: {result_1['reasoning']}")
    
    print("\n📊 Testing Application 2 (Expected: Moderate Score)")
    print("-" * 60)
    result_2 = matcher.calculate_match_score(project_data, application_data_2)
    print(f"Overall Score: {result_2['overall_score']}%")
    print(f"Method: {result_2['method']}")
    print(f"Component Scores:")
    for component, score in result_2['component_scores'].items():
        print(f"  - {component}: {score:.1f}%")
    print(f"Reasoning: {result_2['reasoning']}")
    
    print("\n📊 Testing Application 3 (Expected: Low Score)")
    print("-" * 60)
    result_3 = matcher.calculate_match_score(project_data, application_data_3)
    print(f"Overall Score: {result_3['overall_score']}%")
    print(f"Method: {result_3['method']}")
    print(f"Component Scores:")
    for component, score in result_3['component_scores'].items():
        print(f"  - {component}: {score:.1f}%")
    print(f"Reasoning: {result_3['reasoning']}")
    
    print("\n" + "="*60)
    print("✅ SCORING TEST COMPLETE")
    print("="*60)
    
    # Verify scores are different
    if result_1['overall_score'] > result_2['overall_score'] > result_3['overall_score']:
        print("✅ Scores are correctly differentiated!")
        print(f"   High match: {result_1['overall_score']}%")
        print(f"   Moderate match: {result_2['overall_score']}%")
        print(f"   Low match: {result_3['overall_score']}%")
    else:
        print("⚠️ Scores may not be properly differentiated")
        print(f"   Application 1: {result_1['overall_score']}%")
        print(f"   Application 2: {result_2['overall_score']}%")
        print(f"   Application 3: {result_3['overall_score']}%")

if __name__ == "__main__":
    test_scoring()
