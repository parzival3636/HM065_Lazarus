# Portfolio Table - Simple SQL (No Triggers/Indexes)

## Minimal SQL Query

Run ONLY this in your Supabase SQL editor:

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
```

That's it! No triggers, no indexes needed.

## Why?

- **Triggers**: Optional - only needed if you want automatic timestamp updates
- **Indexes**: Optional - only needed for performance optimization with large datasets
- **For development**: The basic table is sufficient

## If You Already Ran the Full Query

Don't worry! The triggers and indexes won't hurt. They're just extra features that:
- Automatically update `updated_at` timestamp
- Speed up queries by developer_id and featured status

Both are beneficial but not required for the feature to work.

## Next Steps

1. ✅ Table created
2. Restart Django server
3. Login as developer
4. Go to: http://localhost:5173/dashboard/developer/portfolio
5. Click "+ Add Project"
6. Fill in the form and create a project
7. Project should appear in the grid

---

**Status:** Ready to use
**Last Updated:** January 18, 2026
