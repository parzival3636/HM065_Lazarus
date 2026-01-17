# Fix: "No projects available at the moment"

## Problem
Developers see "No projects available at the moment" even though projects should exist.

## Causes
1. **No projects in database** - Projects table is empty
2. **All projects are in draft status** - Only draft projects exist
3. **Projects are cancelled** - All projects are cancelled

## Solution

### Step 1: Check Database
```bash
python manage.py shell
```

Then run:
```python
from projects.models import Project

# Check all projects
all_projects = Project.objects.all()
print(f"Total projects: {all_projects.count()}")

# Check by status
for status in ['draft', 'open', 'shortlisting', 'in_progress', 'review', 'completed', 'cancelled']:
    count = Project.objects.filter(status=status).count()
    print(f"  {status}: {count}")

# List all projects
for p in all_projects:
    print(f"  - {p.title} (status: {p.status})")
```

### Step 2: Create Test Projects
If no projects exist, create test projects:

```bash
python manage.py create_test_projects
```

This will:
- Create a test company user
- Create 5 test projects with status='open'
- Display all projects in database

### Step 3: Verify Projects Are Visible
```bash
python manage.py shell
```

Then run:
```python
from projects.models import Project

# Check visible projects (not draft or cancelled)
visible = Project.objects.exclude(status__in=['draft', 'cancelled'])
print(f"Visible projects: {visible.count()}")

for p in visible:
    print(f"  - {p.title} (status: {p.status})")
```

### Step 4: Test API
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/auth/projects/
```

Should return:
```json
{
  "projects": [
    {
      "id": 1,
      "title": "Build E-commerce Platform",
      "description": "...",
      "budget_min": 2000,
      "budget_max": 5000,
      ...
    }
  ]
}
```

### Step 5: Check Server Logs
When you call the API, check Django server logs for debug output:

```
Total projects in DB: 5
  - Build E-commerce Platform (status: open)
  - Mobile App UI/UX Design (status: open)
  - Machine Learning Model Development (status: open)
  - React Dashboard Development (status: open)
  - API Development for Mobile App (status: open)
Filtered projects: 5
Returning 5 projects
```

## Common Issues

### Issue: "Total projects in DB: 0"
**Solution:** Create test projects
```bash
python manage.py create_test_projects
```

### Issue: "Filtered projects: 0" but "Total projects in DB: 5"
**Solution:** All projects are in draft status. Change them to open:
```python
from projects.models import Project
Project.objects.all().update(status='open')
```

### Issue: Still no projects in frontend
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart Django server
3. Check browser console for errors
4. Check Django server logs

## How to Create Projects as Company

1. Login as company
2. Go to Dashboard
3. Click "Create Project"
4. Fill in project details
5. Click "Create"
6. Project will be created with status='draft'
7. To make it visible to developers, change status to 'open'

## Project Status Meanings

| Status | Visible to Developers | Description |
|--------|----------------------|-------------|
| draft | ✗ No | Still being prepared |
| open | ✓ Yes | Open for applications |
| shortlisting | ✓ Yes | Reviewing applications |
| in_progress | ✓ Yes | Project is active |
| review | ✓ Yes | Under review |
| completed | ✓ Yes | Project completed |
| cancelled | ✗ No | No longer available |

## Quick Checklist

- [ ] Run `python manage.py create_test_projects`
- [ ] Verify projects in database: `python manage.py shell`
- [ ] Check server logs for debug output
- [ ] Clear browser cache
- [ ] Restart Django server
- [ ] Login as developer
- [ ] Go to Projects page
- [ ] Should see projects list

## If Still Not Working

1. Check Django logs for errors
2. Check browser console for API errors
3. Verify authentication token is valid
4. Verify database connection
5. Check that projects have status != 'draft' and != 'cancelled'

---

**Status:** Ready to fix
**Last Updated:** January 18, 2026
