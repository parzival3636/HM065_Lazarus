# Verification Checklist - Developer Projects Fix

## ✅ Step 1: Verify Files Were Updated

### Check backend/projects/api_views.py
```bash
grep -n "exclude(status__in" backend/projects/api_views.py
```
Should show:
```
return Project.objects.exclude(status__in=['draft', 'cancelled'])
```

### Check backend/projects/urls.py
```bash
grep -n "DefaultRouter" backend/projects/urls.py
```
Should show:
```
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
```

### Check frontend/src/services/api.js
```bash
grep -n "Array.isArray(data)" frontend/src/services/api.js
```
Should show:
```
return {
  projects: Array.isArray(data) ? data : data.results || []
}
```

---

## ✅ Step 2: Restart Django Server

```bash
# Stop current server (Ctrl+C)
# Then restart
python manage.py runserver
```

Expected output:
```
Starting development server at http://127.0.0.1:8000/
```

---

## ✅ Step 3: Test as Company

1. **Login as company**
   - Go to http://localhost:3000/login
   - Enter company credentials
   - Click "Sign In"

2. **Verify dashboard**
   - Should see "Company Dashboard"
   - Should see all projects you created
   - Projects can have any status (draft, open, etc.)

3. **Create a test project**
   - Click "Create Project"
   - Fill in project details
   - Click "Create"
   - Project should appear in dashboard with status='draft'

---

## ✅ Step 4: Test as Developer

1. **Login as developer**
   - Go to http://localhost:3000/login
   - Enter developer credentials
   - Click "Sign In"

2. **Verify dashboard**
   - Should see "Browse Projects"
   - Should see projects (except draft and cancelled)
   - Should see the project created in Step 3 if it's published

3. **Verify project details**
   - Click on a project
   - Should see full project details
   - Should see "Apply Now" button

4. **Apply to project**
   - Click "Apply Now"
   - Fill in cover letter
   - Click "Submit Application"
   - Should see success message

---

## ✅ Step 5: Test API Directly

### Get all projects (as developer)
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

### Get all projects (as company)
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

---

## ✅ Step 6: Verify Filtering Logic

### Test 1: Draft projects should NOT appear for developers
1. Create a project as company (status='draft')
2. Login as developer
3. Verify project does NOT appear in list

### Test 2: Open projects SHOULD appear for developers
1. Create a project as company
2. Change status to 'open'
3. Login as developer
4. Verify project DOES appear in list

### Test 3: Cancelled projects should NOT appear for developers
1. Create a project as company
2. Change status to 'cancelled'
3. Login as developer
4. Verify project does NOT appear in list

### Test 4: Companies see all their projects
1. Create multiple projects with different statuses
2. Login as company
3. Verify ALL projects appear (draft, open, cancelled, etc.)

---

## ✅ Step 7: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Login as developer
4. Go to dashboard
5. Verify NO errors in console
6. Check Network tab for successful API calls

Expected:
- ✓ GET /api/projects/ returns 200
- ✓ Response contains projects array
- ✓ No 403 Forbidden errors
- ✓ No 404 Not Found errors

---

## ✅ Step 8: Database Verification

```bash
python manage.py shell
```

Then run:
```python
from projects.models import Project
from accounts.models import User

# Check projects exist
projects = Project.objects.all()
print(f"Total projects: {projects.count()}")

# Check project statuses
for p in projects:
    print(f"Project: {p.title}, Status: {p.status}")

# Check users
developers = User.objects.filter(user_type='developer')
companies = User.objects.filter(user_type='company')
print(f"Developers: {developers.count()}")
print(f"Companies: {companies.count()}")
```

---

## ✅ Step 9: Permission Checks

### Test 1: Developer cannot access company endpoints
```bash
curl -H "Authorization: Bearer <developer_token>" \
     -X POST http://localhost:8000/api/projects/ \
     -H "Content-Type: application/json" \
     -d '{"title": "Test"}'
```
Expected: 403 Forbidden or 400 Bad Request

### Test 2: Company cannot see other company's projects
1. Create project as Company A
2. Login as Company B
3. Verify project does NOT appear

### Test 3: Developer cannot modify projects
```bash
curl -H "Authorization: Bearer <developer_token>" \
     -X PUT http://localhost:8000/api/projects/1/ \
     -H "Content-Type: application/json" \
     -d '{"status": "open"}'
```
Expected: 403 Forbidden

---

## ✅ Step 10: Performance Check

1. Create 50+ projects
2. Login as developer
3. Load projects page
4. Check load time (should be < 2 seconds)
5. Check browser memory usage (should be reasonable)

---

## ✅ Troubleshooting

### Issue: Still no projects for developers
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart Django server
3. Check database for projects with status != 'draft'
4. Check browser console for errors

### Issue: Getting 403 Forbidden
**Solution:**
1. Verify authentication token is valid
2. Check user_type is set correctly
3. Verify user is authenticated

### Issue: Getting 404 Not Found
**Solution:**
1. Verify projects exist in database
2. Check project IDs are correct
3. Verify URL routing is correct

### Issue: Projects appear but can't apply
**Solution:**
1. Check DeveloperProfile exists for user
2. Verify application endpoint is working
3. Check browser console for errors

---

## ✅ Final Checklist

- [ ] Files updated correctly
- [ ] Django server restarted
- [ ] Company can see their projects
- [ ] Developer can see available projects
- [ ] Developer cannot see draft projects
- [ ] Developer cannot see cancelled projects
- [ ] API returns correct responses
- [ ] No errors in browser console
- [ ] No errors in Django logs
- [ ] Permissions working correctly
- [ ] Performance is acceptable
- [ ] Database has correct data

---

## ✅ Success Criteria

✓ Developers see projects in dashboard
✓ Companies see their projects in dashboard
✓ Proper filtering by status
✓ Proper permission checks
✓ No errors in logs
✓ API responses correct
✓ Frontend displays correctly
✓ All tests pass

---

## 🎉 If All Checks Pass

The fix is working correctly! Your developers can now see projects and apply to them.

---

## 📞 If Issues Persist

1. Check `DEVELOPER_PROJECTS_FIX.md` for detailed explanation
2. Review the code changes in the three modified files
3. Check Django logs for errors
4. Check browser console for errors
5. Verify database has correct data

---

**Last Updated:** January 18, 2026
**Status:** Ready for verification
