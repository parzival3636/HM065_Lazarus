#!/usr/bin/env python
"""
Simple test script for fine-tuned model integration.
Run this to test your model without breaking the main system.
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')
django.setup()

from projects.simple_fine_tuned_matcher import run_integration_test

if __name__ == "__main__":
    print("🧪 Simple Fine-tuned Model Integration Test")
    print("This test will check if your model can be loaded without breaking anything.")
    print()
    
    success = run_integration_test()
    
    if success:
        print("\n✅ Ready to integrate your fine-tuned model!")
        print("Next step: Update the main matcher to use your model")
    else:
        print("\n❌ Fix the issues above before proceeding")
        print("The main system will continue working with fallback scoring")