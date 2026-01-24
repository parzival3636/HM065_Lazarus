"""
Setup script for Figma Verification feature.
Run this after installing dependencies to verify everything is working.
"""

import sys
import os

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devconnect.settings')

import django
django.setup()

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    dependencies = {
        'torch': 'PyTorch',
        'open_clip': 'OpenCLIP',
        'PIL': 'Pillow',
        'torchvision': 'TorchVision'
    }
    
    missing = []
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"  ✅ {name} installed")
        except ImportError:
            print(f"  ❌ {name} NOT installed")
            missing.append(name)
    
    if missing:
        print(f"\n⚠️  Missing dependencies: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("\n✅ All dependencies installed!\n")
    return True


def test_openclip():
    """Test OpenCLIP model initialization"""
    print("🧪 Testing OpenCLIP model...")
    
    try:
        from projects.openclip_service import get_openclip_evaluator
        
        print("  📥 Initializing model (this may take a while on first run)...")
        evaluator = get_openclip_evaluator()
        
        print(f"  ✅ Model initialized on device: {evaluator.device}")
        print(f"  ✅ Model ready for evaluation")
        
        return True
    
    except Exception as e:
        print(f"  ❌ Failed to initialize OpenCLIP: {e}")
        return False


def check_migrations():
    """Check if migrations are applied"""
    print("\n🔍 Checking database migrations...")
    
    try:
        from django.core.management import call_command
        from io import StringIO
        
        # Check for unapplied migrations
        out = StringIO()
        call_command('showmigrations', '--plan', stdout=out)
        output = out.getvalue()
        
        if '[ ]' in output:
            print("  ⚠️  Unapplied migrations found")
            print("  Run: python manage.py migrate")
            return False
        else:
            print("  ✅ All migrations applied")
            return True
    
    except Exception as e:
        print(f"  ❌ Error checking migrations: {e}")
        return False


def verify_models():
    """Verify that new models are accessible"""
    print("\n🔍 Verifying models...")
    
    try:
        from projects.models import FigmaShortlist, ProjectApplication
        
        # Check FigmaShortlist model
        print(f"  ✅ FigmaShortlist model accessible")
        
        # Check updated status choices
        status_choices = dict(ProjectApplication.STATUS_CHOICES)
        required_statuses = ['figma_pending', 'figma_submitted']
        
        for status in required_statuses:
            if status in status_choices:
                print(f"  ✅ Status '{status}' available")
            else:
                print(f"  ❌ Status '{status}' NOT found")
                return False
        
        return True
    
    except Exception as e:
        print(f"  ❌ Error verifying models: {e}")
        return False


def check_urls():
    """Check if Figma URLs are registered"""
    print("\n🔍 Checking URL configuration...")
    
    try:
        from django.urls import resolve
        from django.urls.exceptions import Resolver404
        
        test_urls = [
            '/api/projects/1/figma/shortlist/',
            '/api/projects/1/figma/evaluate/',
            '/api/projects/figma/my-shortlists/',
        ]
        
        for url in test_urls:
            try:
                resolve(url)
                print(f"  ✅ {url}")
            except Resolver404:
                print(f"  ❌ {url} NOT found")
                return False
        
        return True
    
    except Exception as e:
        print(f"  ❌ Error checking URLs: {e}")
        return False


def main():
    """Run all checks"""
    print("=" * 60)
    print("Figma Verification Feature Setup")
    print("=" * 60)
    print()
    
    checks = [
        ("Dependencies", check_dependencies),
        ("Database Migrations", check_migrations),
        ("Models", verify_models),
        ("URL Configuration", check_urls),
        ("OpenCLIP Model", test_openclip),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Unexpected error in {name}: {e}")
            results.append((name, False))
        print()
    
    # Summary
    print("=" * 60)
    print("Setup Summary")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
        if not result:
            all_passed = False
    
    print()
    if all_passed:
        print("🎉 All checks passed! Figma verification feature is ready to use.")
        print()
        print("Next steps:")
        print("1. Start the Django server: python manage.py runserver")
        print("2. Navigate to the frontend and test the workflow")
        print("3. Check FIGMA_VERIFICATION_GUIDE.md for usage instructions")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        print()
        print("Common fixes:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run migrations: python manage.py migrate")
        print("3. Check Django settings and URL configuration")
    
    print("=" * 60)


if __name__ == '__main__':
    main()
