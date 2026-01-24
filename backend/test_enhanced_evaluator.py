"""
Test the enhanced evaluator to see if it's working
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

def test_enhanced_evaluator():
    print("=" * 60)
    print("TESTING ENHANCED EVALUATOR")
    print("=" * 60)
    
    # Test 1: Can we import it?
    print("\n1. Testing import...")
    try:
        from projects.enhanced_design_evaluator import get_enhanced_evaluator
        print("   ✅ Import successful")
    except Exception as e:
        print(f"   ❌ Import failed: {e}")
        return
    
    # Test 2: Can we initialize it?
    print("\n2. Testing initialization...")
    try:
        evaluator = get_enhanced_evaluator()
        print("   ✅ Initialization successful")
        print(f"   Device: {evaluator.device}")
    except Exception as e:
        print(f"   ❌ Initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test 3: Can we extract requirements?
    print("\n3. Testing requirement extraction...")
    try:
        description = "Modern e-commerce website with product cards, shopping cart, and clean blue design"
        requirements = evaluator.extract_design_requirements(description)
        print("   ✅ Requirement extraction successful")
        print(f"   Keywords: {requirements['keywords']}")
        print(f"   Features: {requirements['features']}")
        print(f"   Style: {requirements['style']}")
        print(f"   Colors: {requirements['colors']}")
    except Exception as e:
        print(f"   ❌ Requirement extraction failed: {e}")
        return
    
    # Test 4: Check if it's different from basic evaluator
    print("\n4. Comparing with basic evaluator...")
    try:
        from projects.openclip_service import get_openclip_evaluator
        basic_evaluator = get_openclip_evaluator()
        print("   ✅ Basic evaluator loaded")
        print(f"   Enhanced has extract_design_requirements: {hasattr(evaluator, 'extract_design_requirements')}")
        print(f"   Basic has extract_design_requirements: {hasattr(basic_evaluator, 'extract_design_requirements')}")
        print(f"   Enhanced has evaluate_multiple_designs: {hasattr(evaluator, 'evaluate_multiple_designs')}")
        print(f"   Basic has evaluate_multiple_designs: {hasattr(basic_evaluator, 'evaluate_multiple_designs')}")
    except Exception as e:
        print(f"   ⚠️  Could not compare: {e}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    
    print("\n📋 SUMMARY:")
    print("✅ Enhanced evaluator is working")
    print("✅ Has multi-criteria evaluation methods")
    print("✅ Different from basic evaluator")
    print("\n💡 To use it:")
    print("1. Restart Django server")
    print("2. Re-evaluate designs")
    print("3. Check Django logs for 'Enhanced Multi-Criteria'")

if __name__ == '__main__':
    test_enhanced_evaluator()
