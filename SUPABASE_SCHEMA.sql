-- DevConnect Supabase Database Schema
-- Run these queries in your Supabase SQL Editor

-- 1. Developer Profiles Table
CREATE TABLE developer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    bio TEXT DEFAULT '',
    hourly_rate DECIMAL(10,2) DEFAULT 25.00,
    skills TEXT NOT NULL,
    experience VARCHAR(20) DEFAULT 'entry',
    years_experience INTEGER DEFAULT 0,
    portfolio VARCHAR(500) DEFAULT '',
    github VARCHAR(500) DEFAULT '',
    dribbble VARCHAR(500) DEFAULT '',
    behance VARCHAR(500) DEFAULT '',
    linkedin VARCHAR(500) DEFAULT '',
    education VARCHAR(200) DEFAULT '',
    languages VARCHAR(200) DEFAULT 'English',
    availability VARCHAR(20) DEFAULT 'full-time',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    past_projects JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Company Profiles Table
CREATE TABLE company_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    company_size VARCHAR(20) DEFAULT '1-10',
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(500) DEFAULT '',
    description TEXT NOT NULL,
    founded_year INTEGER DEFAULT 2026,
    company_type VARCHAR(20) DEFAULT 'startup',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '[]',
    total_projects_posted INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    average_project_budget DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Portfolio Projects Table
CREATE TABLE portfolio_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    developer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    tech_stack JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    video_url VARCHAR(500) DEFAULT '',
    project_url VARCHAR(500) DEFAULT '',
    github_url VARCHAR(500) DEFAULT '',
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL,
    tech_stack JSONB DEFAULT '[]',
    complexity VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    estimated_duration VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    requirements TEXT DEFAULT '',
    deliverables TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Project Applications Table
CREATE TABLE project_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    proposed_rate DECIMAL(10,2),
    estimated_duration VARCHAR(100) NOT NULL,
    portfolio_links JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending',
    match_score INTEGER,
    skill_match_score INTEGER,
    experience_fit_score INTEGER,
    portfolio_quality_score INTEGER,
    matching_skills JSONB DEFAULT '[]',
    missing_skills JSONB DEFAULT '[]',
    ai_reasoning TEXT DEFAULT '',
    manual_override BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Project Assignments Table
CREATE TABLE project_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES project_applications(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    figma_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    submission_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    figma_submitted BOOLEAN DEFAULT FALSE,
    project_submitted BOOLEAN DEFAULT FALSE
);

-- 7. Project Chats Table
CREATE TABLE project_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES project_assignments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Chat Messages Table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES project_chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'user',
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Figma Design Submissions Table
CREATE TABLE figma_design_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES project_assignments(id) ON DELETE CASCADE,
    figma_url VARCHAR(500) NOT NULL,
    description TEXT DEFAULT '',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Project Submissions Table
CREATE TABLE project_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES project_assignments(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    documentation_links JSONB DEFAULT '[]',
    github_links JSONB DEFAULT '[]',
    project_links JSONB DEFAULT '[]',
    additional_links JSONB DEFAULT '[]',
    approved BOOLEAN,
    company_feedback TEXT DEFAULT '',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_design_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for developer_profiles
CREATE POLICY "Users can view all developer profiles" ON developer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own developer profile" ON developer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own developer profile" ON developer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for company_profiles
CREATE POLICY "Users can view all company profiles" ON company_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own company profile" ON company_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own company profile" ON company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for portfolio_projects
CREATE POLICY "Users can view all portfolio projects" ON portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Developers can manage own portfolio projects" ON portfolio_projects FOR ALL USING (auth.uid() = developer_id);

-- RLS Policies for projects
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Companies can manage own projects" ON projects FOR ALL USING (auth.uid() = company_id);

-- RLS Policies for project_applications
CREATE POLICY "Users can view applications for their projects/applications" ON project_applications FOR SELECT USING (
    auth.uid() = developer_id OR 
    auth.uid() IN (SELECT company_id FROM projects WHERE id = project_id)
);
CREATE POLICY "Developers can create applications" ON project_applications FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Users can update applications they're involved in" ON project_applications FOR UPDATE USING (
    auth.uid() = developer_id OR 
    auth.uid() IN (SELECT company_id FROM projects WHERE id = project_id)
);

-- RLS Policies for project_assignments
CREATE POLICY "Users can view assignments they're involved in" ON project_assignments FOR SELECT USING (
    auth.uid() = developer_id OR 
    auth.uid() IN (SELECT company_id FROM projects WHERE id = project_id)
);
CREATE POLICY "Companies can create assignments for their projects" ON project_assignments FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT company_id FROM projects WHERE id = project_id)
);
CREATE POLICY "Users can update assignments they're involved in" ON project_assignments FOR UPDATE USING (
    auth.uid() = developer_id OR 
    auth.uid() IN (SELECT company_id FROM projects WHERE id = project_id)
);

-- RLS Policies for project_chats
CREATE POLICY "Users can view chats for their assignments" ON project_chats FOR SELECT USING (
    auth.uid() IN (
        SELECT developer_id FROM project_assignments WHERE id = assignment_id
        UNION
        SELECT company_id FROM projects p 
        JOIN project_assignments pa ON p.id = pa.project_id 
        WHERE pa.id = assignment_id
    )
);
CREATE POLICY "Users can create chats for their assignments" ON project_chats FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT developer_id FROM project_assignments WHERE id = assignment_id
        UNION
        SELECT company_id FROM projects p 
        JOIN project_assignments pa ON p.id = pa.project_id 
        WHERE pa.id = assignment_id
    )
);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chats" ON chat_messages FOR SELECT USING (
    auth.uid() IN (
        SELECT developer_id FROM project_assignments pa
        JOIN project_chats pc ON pa.id = pc.assignment_id
        WHERE pc.id = chat_id
        UNION
        SELECT company_id FROM projects p
        JOIN project_assignments pa ON p.id = pa.project_id
        JOIN project_chats pc ON pa.id = pc.assignment_id
        WHERE pc.id = chat_id
    )
);
CREATE POLICY "Users can send messages in their chats" ON chat_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
        SELECT developer_id FROM project_assignments pa
        JOIN project_chats pc ON pa.id = pc.assignment_id
        WHERE pc.id = chat_id
        UNION
        SELECT company_id FROM projects p
        JOIN project_assignments pa ON p.id = pa.project_id
        JOIN project_chats pc ON pa.id = pc.assignment_id
        WHERE pc.id = chat_id
    )
);

-- RLS Policies for figma_design_submissions
CREATE POLICY "Users can view figma submissions for their assignments" ON figma_design_submissions FOR SELECT USING (
    auth.uid() IN (
        SELECT developer_id FROM project_assignments WHERE id = assignment_id
        UNION
        SELECT company_id FROM projects p 
        JOIN project_assignments pa ON p.id = pa.project_id 
        WHERE pa.id = assignment_id
    )
);
CREATE POLICY "Developers can create figma submissions for their assignments" ON figma_design_submissions FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT developer_id FROM project_assignments WHERE id = assignment_id)
);

-- RLS Policies for project_submissions
CREATE POLICY "Users can view project submissions for their assignments" ON project_submissions FOR SELECT USING (
    auth.uid() IN (
        SELECT developer_id FROM project_assignments WHERE id = assignment_id
        UNION
        SELECT company_id FROM projects p 
        JOIN project_assignments pa ON p.id = pa.project_id 
        WHERE pa.id = assignment_id
    )
);
CREATE POLICY "Developers can create project submissions for their assignments" ON project_submissions FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT developer_id FROM project_assignments WHERE id = assignment_id)
);
CREATE POLICY "Companies can update project submissions for their projects" ON project_submissions FOR UPDATE USING (
    auth.uid() IN (
        SELECT company_id FROM projects p 
        JOIN project_assignments pa ON p.id = pa.project_id 
        WHERE pa.id = assignment_id
    )
);