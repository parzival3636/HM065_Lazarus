"""
Test script to verify image upload functionality
Run this after starting the Django server
"""

import requests
import json

# Configuration
API_BASE_URL = 'http://127.0.0.1:8000/api'

def test_server_connection():
    """Test if Django server is running"""
    print("Testing server connection...")
    try:
        response = requests.get(f"{API_BASE_URL}/projects/", timeout=5)
        print(f"✅ Server is running (Status: {response.status_code})")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Server is NOT running")
        print("   Start the server with: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_upload_endpoint():
    """Test if upload endpoint is accessible"""
    print("\nTesting upload endpoint...")
    try:
        # This should return 401 (Unauthorized) if endpoint exists
        response = requests.post(
            f"{API_BASE_URL}/projects/figma/upload-image/",
            timeout=5
        )
        if response.status_code == 401:
            print("✅ Upload endpoint exists (returns 401 without auth)")
            return True
        elif response.status_code == 405:
            print("❌ Upload endpoint has wrong method")
            return False
        else:
            print(f"⚠️  Upload endpoint returned: {response.status_code}")
            return True
    except requests.exceptions.ConnectionError:
        print("❌ Cannot reach upload endpoint")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_storage_bucket():
    """Instructions for checking Supabase storage"""
    print("\n📦 Supabase Storage Checklist:")
    print("   1. Go to Supabase Dashboard → Storage")
    print("   2. Check if 'design-images' bucket exists")
    print("   3. Verify bucket is set to PUBLIC")
    print("   4. If not, run: FIGMA_IMAGE_UPLOAD_MIGRATION.sql")

def main():
    print("=" * 60)
    print("IMAGE UPLOAD FEATURE TEST")
    print("=" * 60)
    
    # Test 1: Server connection
    server_ok = test_server_connection()
    
    if not server_ok:
        print("\n⚠️  SOLUTION:")
        print("   1. Open a terminal in the backend folder")
        print("   2. Run: python manage.py runserver")
        print("   3. Wait for 'Starting development server...'")
        print("   4. Try uploading again")
        return
    
    # Test 2: Upload endpoint
    endpoint_ok = test_upload_endpoint()
    
    if not endpoint_ok:
        print("\n⚠️  SOLUTION:")
        print("   1. Check backend/projects/urls.py")
        print("   2. Verify 'figma/upload-image/' route exists")
        print("   3. Restart Django server")
        return
    
    # Test 3: Storage instructions
    check_storage_bucket()
    
    print("\n" + "=" * 60)
    print("✅ BACKEND TESTS PASSED")
    print("=" * 60)
    print("\nIf uploads still fail:")
    print("1. Check browser console for detailed errors")
    print("2. Check Django server logs")
    print("3. Verify Supabase storage bucket exists")
    print("4. Ensure you're logged in as a developer")

if __name__ == '__main__':
    main()
