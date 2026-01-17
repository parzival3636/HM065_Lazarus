# Developer Portfolio Feature Setup

## Supabase Table Creation

Run this SQL in your Supabase SQL editor to create the portfolio projects table:

```sql
-- Create portfolio_project table for developer portfolios
CREATE TABLE portfolio_project (
    id SERIAL PRIMARY KEY,
    developer_id INTEGER NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    tech_stack JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',  -- Array of image URLs
    video_url VARCHAR(500),      -- Optional video URL
    project_url VARCHAR(500),    -- Live project URL
    github_url VARCHAR(500),     -- GitHub repository URL
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_portfolio_project_developer_id ON portfolio_project(developer_id);
CREATE INDEX idx_portfolio_project_featured ON portfolio_project(featured);

-- Add trigger to update updated_at timestamp
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

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| developer_id | INTEGER | Foreign key to accounts_user |
| title | VARCHAR(200) | Project title |
| description | TEXT | Project description |
| tech_stack | JSONB | Array of technologies used |
| images | JSONB | Array of image URLs |
| video_url | VARCHAR(500) | Optional video URL |
| project_url | VARCHAR(500) | Live project URL |
| github_url | VARCHAR(500) | GitHub repository URL |
| featured | BOOLEAN | Whether to feature on profile |
| views_count | INTEGER | Number of views |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Example Data Structure

```json
{
  "id": 1,
  "developer_id": 5,
  "title": "E-commerce Platform",
  "description": "A full-stack e-commerce platform built with React and Node.js",
  "tech_stack": ["React", "Node.js", "MongoDB", "Stripe"],
  "images": [
    "https://storage.supabase.co/portfolio/project1-1.jpg",
    "https://storage.supabase.co/portfolio/project1-2.jpg"
  ],
  "video_url": "https://youtube.com/watch?v=...",
  "project_url": "https://myecommerce.com",
  "github_url": "https://github.com/user/ecommerce",
  "featured": true,
  "views_count": 245,
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

## Features

✅ Upload multiple projects
✅ Add photos (compulsory)
✅ Add video (optional)
✅ Add description
✅ Add tech stack
✅ Add project URL
✅ Add GitHub URL
✅ Featured projects
✅ View count tracking
✅ Card-based display
✅ Modal view for details
✅ Edit/Delete projects

---

**Status:** Ready to implement
**Last Updated:** January 18, 2026
