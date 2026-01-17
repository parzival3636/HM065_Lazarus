# Developer Portfolio Feature - Complete Implementation Guide

## Overview
A complete portfolio system for developers to showcase their projects with images, videos, descriptions, and tech stacks.

## Database Setup

### Step 1: Create Supabase Table
Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE portfolio_project (
    id SERIAL PRIMARY KEY,
    developer_id INTEGER NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    tech_stack JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    video_url VARCHAR(500),
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolio_project_developer_id ON portfolio_project(developer_id);
CREATE INDEX idx_portfolio_project_featured ON portfolio_project(featured);

CREATE OR REPLACE FUNCTION update_portfolio_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_project_timestamp
BEFORE UPDATE ON portfolio_project
FOR EACH ROW
EXECUTE FUNCTION update_portfolio_project_timestamp();
```

## Backend Implementation

### Files Created/Modified

1. **backend/accounts/portfolio_views.py** (NEW)
   - `get_developer_portfolio()` - Get all portfolio projects
   - `create_portfolio_project()` - Create new project
   - `update_portfolio_project()` - Update project
   - `delete_portfolio_project()` - Delete project
   - `increment_portfolio_views()` - Track views

2. **backend/accounts/urls.py** (MODIFIED)
   - Added portfolio endpoints

### API Endpoints

```
GET    /api/auth/portfolio/{developer_id}/
       └─ Get all portfolio projects for a developer

POST   /api/auth/portfolio/create/
       └─ Create new portfolio project

PUT    /api/auth/portfolio/{project_id}/update/
       └─ Update portfolio project

DELETE /api/auth/portfolio/{project_id}/delete/
       └─ Delete portfolio project

POST   /api/auth/portfolio/{project_id}/views/
       └─ Increment view count
```

## Frontend Implementation

### Files Created/Modified

1. **frontend/src/components/DeveloperPortfolio.jsx** (NEW)
   - Portfolio grid display
   - Add project form
   - Project modal with details
   - Image gallery
   - Video player
   - Tech stack display

2. **frontend/src/components/Portfolio.css** (NEW)
   - Responsive grid layout
   - Card styling
   - Modal styling
   - Form styling

3. **frontend/src/services/api.js** (MODIFIED)
   - `getDeveloperPortfolio()`
   - `createPortfolioProject()`
   - `updatePortfolioProject()`
   - `deletePortfolioProject()`
   - `incrementPortfolioViews()`

## Features

### For Developers

✅ **Add Projects**
- Title (required)
- Description (required)
- Images (required - at least 1)
- Video URL (optional)
- Project URL (optional)
- GitHub URL (optional)
- Tech stack (multiple)
- Featured flag

✅ **View Projects**
- Card-based grid layout
- Hover effects
- View count tracking
- Featured badge

✅ **Project Details Modal**
- Full-size image gallery
- Video player (YouTube)
- Complete description
- Tech stack display
- Links to live project and GitHub
- Delete option

✅ **Portfolio Management**
- Create projects
- Edit projects
- Delete projects
- Feature projects
- Track views

### For Visitors

✅ **Browse Portfolio**
- View all projects
- See featured projects
- Click to view details
- Watch videos
- View images
- Check tech stack
- Visit live projects
- View GitHub repos

## Usage

### For Developers

1. **Navigate to Portfolio**
   - Go to: `http://localhost:5173/dashboard/developer/portfolio`

2. **Add a Project**
   - Click "+ Add Project"
   - Fill in project details
   - Add at least one image
   - Add tech stack
   - Click "Create Project"

3. **View Project Details**
   - Click on any project card
   - View full details in modal
   - See images, video, description
   - Click links to live project or GitHub

4. **Manage Projects**
   - Edit project details
   - Delete projects
   - Feature projects on profile

### For Companies/Visitors

1. **View Developer Portfolio**
   - Click on developer profile
   - See portfolio section
   - Click projects to view details
   - Check tech stack and experience

## Data Structure

### Portfolio Project Object

```javascript
{
  id: 1,
  developer_id: 5,
  title: "E-commerce Platform",
  description: "A full-stack e-commerce platform...",
  tech_stack: ["React", "Node.js", "MongoDB", "Stripe"],
  images: [
    "https://storage.supabase.co/portfolio/project1-1.jpg",
    "https://storage.supabase.co/portfolio/project1-2.jpg"
  ],
  video_url: "https://youtube.com/watch?v=...",
  project_url: "https://myecommerce.com",
  github_url: "https://github.com/user/ecommerce",
  featured: true,
  views_count: 245,
  created_at: "2026-01-18T10:00:00Z",
  updated_at: "2026-01-18T10:00:00Z"
}
```

## API Request Examples

### Get Developer Portfolio
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/auth/portfolio/5/
```

### Create Portfolio Project
```bash
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "E-commerce Platform",
       "description": "Full-stack e-commerce...",
       "tech_stack": ["React", "Node.js"],
       "images": ["https://..."],
       "video_url": "https://youtube.com/...",
       "project_url": "https://myproject.com",
       "github_url": "https://github.com/...",
       "featured": true
     }' \
     http://localhost:8000/api/auth/portfolio/create/
```

### Update Portfolio Project
```bash
curl -X PUT \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Updated Title",
       "featured": false
     }' \
     http://localhost:8000/api/auth/portfolio/1/update/
```

### Delete Portfolio Project
```bash
curl -X DELETE \
     -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/auth/portfolio/1/delete/
```

## Integration Steps

### Step 1: Database
- [ ] Run SQL to create `portfolio_project` table

### Step 2: Backend
- [ ] Verify `backend/accounts/portfolio_views.py` exists
- [ ] Verify `backend/accounts/urls.py` has portfolio routes
- [ ] Restart Django server

### Step 3: Frontend
- [ ] Verify `frontend/src/components/DeveloperPortfolio.jsx` exists
- [ ] Verify `frontend/src/components/Portfolio.css` exists
- [ ] Verify API functions in `frontend/src/services/api.js`

### Step 4: Routing
- [ ] Add route to portfolio page in main router
- [ ] Link from developer dashboard

### Step 5: Testing
- [ ] Login as developer
- [ ] Navigate to portfolio
- [ ] Create a test project
- [ ] View project details
- [ ] Test all features

## Troubleshooting

### Issue: "No portfolio projects yet"
**Solution:** Create a test project using the form

### Issue: Images not loading
**Solution:** Ensure image URLs are valid and accessible

### Issue: Video not playing
**Solution:** Use YouTube embed URL format: `https://youtube.com/watch?v=VIDEO_ID`

### Issue: API errors
**Solution:** Check Django logs and verify authentication token

## Performance Optimization

- Images are lazy-loaded
- View count increments asynchronously
- Grid uses CSS Grid for responsive layout
- Modal uses React state for efficient rendering

## Security

- Authentication required for create/update/delete
- Ownership verification before modifications
- CSRF protection enabled
- Input validation on backend

## Future Enhancements

- [ ] Image upload to Supabase Storage
- [ ] Video upload support
- [ ] Project filtering by tech stack
- [ ] Portfolio sharing/export
- [ ] Analytics dashboard
- [ ] Comments/reviews on projects
- [ ] Collaboration features

---

**Status:** ✅ Ready to implement
**Last Updated:** January 18, 2026
**Version:** 1.0
