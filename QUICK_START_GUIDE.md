# Quick Start Guide - DevConnect with ML Matcher

## ✅ All Issues Fixed!

1. ✅ Companies can now post projects
2. ✅ Developers can now apply to projects  
3. ✅ ML matcher automatically scores applications

## Start the Application

### Backend (Terminal 1):
```bash
cd backend
python manage.py runserver
```

Backend will run on: http://localhost:8000

### Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## Test the Complete Flow

### 1. Register as Company
1. Go to http://localhost:5173
2. Click "Post a Project" or "Get Started"
3. Select "Company" registration
4. Fill out:
   - Email: company@test.com
   - Password: Test123!
   - Company Name: Tech Startup Inc
   - Industry: Technology
   - Company Size: 11-50
   - Country: United States
5. Click "Register"

### 2. Post a Project
1. After login, click "Post Project" in navbar
2. Fill out project form:
   - **Title**: "E-commerce Website Development"
   - **Description**: "We need an experienced full-stack developer to build a modern e-commerce platform with React frontend and Node.js backend. Must have experience with payment integration and responsive design."
   - **Category**: Web Development
   - **Experience Level**: Intermediate
   - **Skills**: React, Node.js, MongoDB, Stripe, Tailwind CSS
   - **Budget**: $5000
   - **Timeline**: 8 weeks
3. Click "Post Project"
4. ✅ Project is now visible to all developers!

### 3. Register as Developer
1. Open new incognito/private window
2. Go to http://localhost:5173
3. Click "Find Work"
4. Select "Developer" registration
5. Fill out:
   - Email: developer@test.com
   - Password: Test123!
   - First Name: John
   - Last Name: Doe
   - Title: Full Stack Developer
   - Skills: React, Node.js, MongoDB, Express, JavaScript
   - Experience: Intermediate (2-5 years)
   - Years Experience: 3
   - Hourly Rate: $50
   - Country: United States
6. Click "Register"

### 4. Apply to Project
1. After login, click "Browse Projects"
2. You should see "E-commerce Website Development"
3. Click "Apply Now"
4. Fill out application:
   - **Cover Letter**: 
     ```
     I am an experienced full-stack developer with 3 years of experience building e-commerce platforms. I have successfully delivered 5+ similar projects using React, Node.js, and MongoDB. 
     
     I'm proficient in:
     - React with modern hooks and state management
     - Node.js/Express REST APIs
     - MongoDB database design
     - Stripe payment integration
     - Responsive design with Tailwind CSS
     
     I can complete this project within 8 weeks and deliver a high-quality, scalable solution.
     ```
   - **Proposed Budget**: $4800
   - **Timeline**: 8 weeks
5. Click "Submit Application"
6. ✅ Application submitted with ML scores calculated!

### 5. View Applications with ML Scores
1. Switch back to company account
2. Go to "My Projects"
3. Click on "E-commerce Website Development"
4. Click "View Applications"
5. ✅ You'll see the application with:
   - **Overall Match Score**: ~75-85% (calculated by ML)
   - **Skill Match**: Shows matching skills (React, Node.js, MongoDB)
   - **Experience Fit**: Based on years of experience
   - **Portfolio Quality**: Based on developer rating
   - **Missing Skills**: Any skills the developer doesn't have
   - **AI Reasoning**: Explanation of the match

## What the ML Matcher Does

When a developer applies, the system automatically:

1. **Extracts Features**:
   - Project requirements (title, description, tech stack)
   - Developer profile (skills, experience, bio)
   - Application quality (cover letter length, detail)
   - Portfolio similarity

2. **Calculates Embeddings**:
   - Uses BERT (all-MiniLM-L6-v2) to create semantic embeddings
   - Compares project description to developer profile
   - Analyzes proposal relevance

3. **Computes Scores**:
   - **Skill Match**: Percentage of required skills the developer has
   - **Experience Fit**: How well experience level matches
   - **Portfolio Quality**: Based on rating and past projects
   - **Proposal Quality**: Cover letter detail and relevance
   - **Rate Fit**: How proposed rate compares to budget

4. **Generates Overall Score**:
   - Uses trained Gradient Boosting and Random Forest models
   - Combines all features into 0-100 score
   - Higher score = better match

5. **Provides Transparency**:
   - Lists matching skills
   - Lists missing skills
   - Explains reasoning in plain English

## API Endpoints Working

### Company:
- `POST /api/auth/company/projects/create/` - Create project ✅
- `GET /api/auth/company/projects/` - List my projects ✅
- `GET /api/auth/company/projects/{id}/applications/` - View applications ✅
- `PUT /api/auth/company/projects/{id}/edit/` - Edit project ✅

### Developer:
- `GET /api/auth/projects/` - Browse projects ✅
- `POST /api/auth/projects/{id}/apply/` - Apply to project ✅

### Auth:
- `POST /api/auth/register/company/` - Register company ✅
- `POST /api/auth/register/developer/` - Register developer ✅
- `POST /api/auth/login/` - Login ✅
- `GET /api/auth/profile/` - Get user profile ✅

## Database Schema

All tables are properly set up with:

### projects_project
- Standard project fields
- Status: draft, open, shortlisting, in_progress, completed, cancelled

### projects_projectapplication
- Standard application fields
- **ML Fields**:
  - match_score (0-100)
  - skill_match_score
  - experience_fit_score
  - portfolio_quality_score
  - matching_skills (JSON array)
  - missing_skills (JSON array)
  - ai_reasoning (text)
  - manual_override (boolean)

### accounts_developerprofile
- Standard profile fields
- **past_projects** (JSON array for ML matching)

### portfolio_project
- Developer portfolio showcase
- Used by ML for similarity matching

## Troubleshooting

### Backend won't start:
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend won't start:
```bash
cd frontend
npm install
npm run dev
```

### ML matcher errors:
```bash
cd backend
python test_matcher.py
```

### Database issues:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Next Steps

Now that everything works, you can:

1. **Add more developers** - Register multiple developer accounts
2. **Post more projects** - Create various project types
3. **Test ML scoring** - See how different applications score
4. **View rankings** - Companies see best matches first
5. **Customize frontend** - Display ML scores in UI
6. **Add filters** - Filter by minimum match score
7. **Collect feedback** - Track which matches lead to hires

## Success Metrics

The system is working when:
- ✅ Companies can post projects without errors
- ✅ Projects appear in developer's "Browse Projects"
- ✅ Developers can submit applications
- ✅ Applications show up with match scores
- ✅ Scores are between 0-100
- ✅ Matching/missing skills are listed
- ✅ AI reasoning is provided

All of these are now working! 🎉
