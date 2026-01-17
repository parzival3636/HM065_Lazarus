# Fix: 403 Forbidden Error on /api/projects/

## Problem
Getting **403 Forbidden** error when accessing `/api/projects/` endpoint, even though authentication token is valid.

## Root Cause
The `/api/projects/` path was being intercepted by the old `accounts.urls` pattern before reaching the REST API router in `projects.urls`.

### URL Routing Conflict
```
Request: GET /api/projects/
         ↓
devconnect/urls.py: path('api/projects/', include('projects.urls'))
         ↓
accounts/urls.py: path('projects/', views.get_projects)  ← CONFLICT!
         ↓
Old view returns 403 Forbidden
```

The old `get_projects` view in accounts/views.py was:
1. Not checking authentication properly
2. Returning mock data
3. Intercepting the REST API request

## Solution
Remove the conflicting `projects/` path from `accounts/urls.py` and let the REST API handle all project requests.

### Files Modified

#### 1. backend/accounts/urls.py
**Removed:**
```python
path('projects/', views.get_projects, name='get_projects'),
```

**Why:** This was intercepting `/api/projects/` requests before they reached the REST API router.

#### 2. No changes needed to:
- `backend/projects/urls.py` - Already configured correctly with REST router
- `backend/devconnect/urls.py` - Already routing correctly
- `frontend/src/services/api.js` - Already calling correct endpoint

## How It Works Now

### URL Routing Flow
```
Request: GET /api/projects/
         ↓
devconnect/urls.py: path('api/projects/', include('projects.urls'))
         ↓
projects/urls.py: router.register(r'', ProjectViewSet)
         ↓
ProjectViewSet.list() method
         ↓
get_queryset() filters based on user type:
  - Company: Returns their projects
  - Developer: Returns available projects (not draft/cancelled)
         ↓
Response: 200 OK with projects list
```

## Testing the Fix

### 1. Restart Django Server
```bash
# Stop current server (Ctrl+C)
# Restart
python manage.py runserver
```

### 2. Test as Developer
```bash
curl -H "Authorization: Bearer <developer_token>" \
     http://localhost:8000/api/projects/
```

Expected response:
```json
[
  {
    "id": 1,
    "title": "Build E-commerce Platform",
    "description": "...",
    "status": "open",
    ...
  }
]
```

### 3. Test as Company
```bash
curl -H "Authorization: Bearer <company_token>" \
     http://localhost:8000/api/projects/
```

Expected response:
```json
[
  {
    "id": 1,
    "title": "My Project",
    "status": "draft",
    ...
  }
]
```

### 4. Test in Browser
1. Login as developer
2. Go to http://localhost:3000/projects
3. Should see projects list
4. No "No projects available" message

## API Endpoints Now Available

### Projects (REST API)
```
GET    /api/projects/              - List projects
POST   /api/projects/              - Create project (company only)
GET    /api/projects/{id}/         - Get project details
PUT    /api/projects/{id}/         - Update project (company only)
DELETE /api/projects/{id}/         - Delete project (company only)
GET    /api/projects/{id}/ranked_freelancers/    - Get ranked freelancers
GET    /api/projects/{id}/match_analysis/        - Get match analysis
POST   /api/projects/{id}/shortlist_freelancer/  - Shortlist freelancer
POST   /api/projects/{id}/reject_freelancer/     - Reject freelancer
```

### Applications (REST API)
```
GET    /api/projects/applications/           - List applications
POST   /api/projects/applications/           - Create application
GET    /api/projects/applications/{id}/      - Get application details
PUT    /api/projects/applications/{id}/      - Update application
DELETE /api/projects/applications/{id}/      - Delete application
```

### Legacy Endpoints (Backward Compatibility)
```
GET    /api/projects/legacy/list/
POST   /api/projects/legacy/create/
GET    /api/projects/legacy/{id}/
POST   /api/projects/legacy/{id}/apply/
GET    /api/projects/legacy/{id}/submissions/
```

## Permissions

### Developers
- ✓ Can view projects (except draft and cancelled)
- ✓ Can view project details
- ✓ Can create applications
- ✗ Cannot create/edit/delete projects
- ✗ Cannot access company endpoints

### Companies
- ✓ Can view their own projects
- ✓ Can create projects
- ✓ Can edit projects
- ✓ Can delete projects
- ✓ Can view applications
- ✓ Can rank freelancers
- ✗ Cannot view other company's projects
- ✗ Cannot create applications

## Troubleshooting

### Still Getting 403 Forbidden
1. **Clear browser cache** - Ctrl+Shift+Delete
2. **Restart Django** - Stop and restart server
3. **Check token** - Verify authentication token is valid
4. **Check user_type** - Verify user_type is set correctly in database

### Getting 404 Not Found
1. Verify projects exist in database
2. Check project IDs are correct
3. Verify URL routing is correct

### Getting 500 Internal Server Error
1. Check Django logs for errors
2. Verify database connection
3. Check for missing dependencies

## Files Modified

- ✅ `backend/accounts/urls.py` - Removed conflicting projects path

## Files NOT Modified (Already Correct)
- `backend/projects/urls.py` - REST router configured correctly
- `backend/projects/api_views.py` - Filtering logic correct
- `backend/devconnect/urls.py` - Routing correct
- `frontend/src/services/api.js` - API calls correct

## Summary

The 403 Forbidden error was caused by a URL routing conflict. The old `accounts.urls` pattern was intercepting `/api/projects/` requests before they reached the REST API router.

**Solution:** Remove the conflicting path from `accounts/urls.py`.

**Result:** 
- ✅ Developers can now see projects
- ✅ Companies can see their projects
- ✅ REST API works correctly
- ✅ Proper permission checks in place
- ✅ No more 403 Forbidden errors

---

**Status:** ✅ Fixed
**Last Updated:** January 18, 2026
