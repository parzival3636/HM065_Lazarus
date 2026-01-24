# DevConnect - Developer-Company Matching Platform

A full-stack web application that connects companies with developers through AI-powered matching, team assignments, real-time chat, and collaborative project management.

## 🌟 Features

### Core Features
- **AI-Powered Matching**: Fine-tuned ML model for matching developers with projects
- **Smart Application Ranking**: Top 3 applicants highlighted with AI scoring
- **Team Formation**: Create teams or assign individual developers
- **Real-time Chat**: TalkJS integration for seamless team communication
- **File Sharing**: Upload and share files, documents, and links with team members
- **Project Submissions**: Figma design and final project submission workflows
- **Deadline Management**: Automated deadline tracking and notifications

### For Companies
- Post projects with detailed requirements
- Review AI-ranked applications
- Create teams from top applicants
- Manage multiple team assignments
- Track submissions and deadlines
- Real-time communication with developers

### For Developers
- Browse available projects
- Apply with AI-enhanced profiles
- Join team assignments
- Submit Figma designs and final projects
- Collaborate via real-time chat
- Share files and links with team members

## 🏗️ Tech Stack

### Backend
- **Framework**: Django + Django REST Framework
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **ML/AI**: Sentence Transformers (fine-tuned model)
- **Python**: 3.8+

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: CSS3 with custom components
- **Real-time Chat**: TalkJS
- **HTTP Client**: Fetch API
- **Routing**: React Router

### Infrastructure
- **Database**: Supabase PostgreSQL
- **Storage**: Cloud storage ready (AWS S3, Cloudinary)
- **Real-time**: TalkJS WebSocket

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Supabase account
- TalkJS account

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Create a `.env` file in the backend directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SECRET_KEY=your_django_secret_key
DEBUG=True
```

5. **Run database migrations**
```bash
python manage.py migrate
```

6. **Run the development server**
```bash
python manage.py runserver
```

Backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure TalkJS**
Edit `src/config/talkjs.config.js`:
```javascript
export const TALKJS_APP_ID = 'your_talkjs_app_id'
```

4. **Run the development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Database Setup

1. **Create Supabase project**
   - Go to https://supabase.com
   - Create a new project
   - Copy your project URL and keys

2. **Run SQL migrations**
   Execute these SQL files in Supabase SQL Editor:
   - `SUPABASE_SCHEMA.sql` - Main schema
   - `TEAM_ASSIGNMENT_SCHEMA.sql` - Team assignments
   - `FILE_SHARING_SCHEMA.sql` - File sharing

### TalkJS Setup

1. **Create TalkJS account**
   - Go to https://talkjs.com
   - Create a new app
   - Copy your App ID

2. **Configure in frontend**
   - Update `frontend/src/config/talkjs.config.js` with your App ID

## 🚀 Usage

### For Companies

1. **Register/Login** as a company
2. **Post a Project** with requirements and budget
3. **Review Applications** - See AI-ranked top 3 applicants
4. **Create Team** - Select multiple developers or assign individually
5. **Manage Assignments** - Track submissions and communicate via chat
6. **Review Submissions** - Check Figma designs and final projects

### For Developers

1. **Register/Login** as a developer
2. **Browse Projects** - View available opportunities
3. **Apply** - Submit application with portfolio
4. **Join Team** - Accept team assignment
5. **Collaborate** - Use chat and file sharing
6. **Submit Work** - Upload Figma designs and final projects

## 📁 Project Structure

```
HM065_Lazarus/
├── backend/
│   ├── accounts/           # User authentication & profiles
│   ├── projects/           # Project management & matching
│   │   ├── team_assignment_views.py  # Team assignment logic
│   │   ├── matcher.py      # AI matching engine
│   │   └── views.py        # Project CRUD operations
│   ├── devconnect/         # Django settings
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EnhancedProjectApplications.jsx  # Application ranking
│   │   │   ├── CompanyTeamAssignments.jsx       # Company view
│   │   │   ├── DeveloperTeamAssignments.jsx     # Developer view
│   │   │   ├── TalkJSChat.jsx                   # Real-time chat
│   │   │   ├── FileSharing.jsx                  # File sharing
│   │   │   └── ...
│   │   ├── config/
│   │   │   └── talkjs.config.js  # TalkJS configuration
│   │   ├── utils/
│   │   └── services/
│   └── package.json
├── TEAM_ASSIGNMENT_SCHEMA.sql
├── FILE_SHARING_SCHEMA.sql
├── SUPABASE_SCHEMA.sql
└── README.md
```

## 🔑 Key Features Explained

### AI-Powered Matching
- Fine-tuned Sentence Transformer model
- Analyzes developer skills vs project requirements
- Provides match scores and reasoning
- Ranks applicants automatically

### Team Assignment Workflow
1. Company reviews AI-ranked applications
2. Selects top developers (multi-select checkboxes)
3. Creates team with custom name
4. System sets deadlines (7 days Figma, 30 days final)
5. Developers receive notifications
6. Team chat and file sharing activated

### Real-time Chat (TalkJS)
- Instant messaging between team members
- Message history persistence
- User presence indicators
- Professional chat UI

### File Sharing System
- Upload PDFs, ZIPs, images, documents
- Share links with descriptions
- Synced across all team members
- Download and delete capabilities

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SECRET_KEY=your_django_secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Frontend (talkjs.config.js)**
```javascript
export const TALKJS_APP_ID = 'your_app_id'
export const TALKJS_ENABLED = true
```

## 📊 Database Schema

### Main Tables
- `users` - User authentication (Supabase Auth)
- `projects` - Project listings
- `project_applications` - Developer applications
- `team_assignments` - Team assignments
- `team_assignment_members` - Team membership
- `team_chats` - Chat groups
- `team_chat_messages` - Chat messages
- `shared_files` - Uploaded files
- `shared_links` - Shared links

See SQL files for complete schema.

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📝 API Documentation

### Team Assignment Endpoints

**Create Team Assignment**
```
POST /api/projects/team-assignments/create_team_assignment/
Body: {
  "project_id": "uuid",
  "team_name": "string",
  "developer_ids": ["uuid1", "uuid2"]
}
```

**Get Team Assignments (Company)**
```
GET /api/projects/team-assignments/get_team_assignments/
```

**Get Team Assignments (Developer)**
```
GET /api/projects/team-assignments/get_developer_team_assignments/
```

**Submit Figma**
```
POST /api/projects/team-assignments/{id}/submit_figma/
Body: {
  "figma_url": "string",
  "figma_images": ["url1", "url2"]
}
```

**Submit Project**
```
POST /api/projects/team-assignments/{id}/submit_project/
Body: {
  "submission_links": {
    "github": "url",
    "live_url": "url",
    "zip_file": "url",
    "documents": ["url1"],
    "other": "url"
  }
}
```

**Share File**
```
POST /api/projects/team-assignments/{id}/share_file/
Body: {
  "name": "filename.pdf",
  "url": "file_url",
  "size": 1024,
  "type": "application/pdf"
}
```

**Share Link**
```
POST /api/projects/team-assignments/{id}/share_link/
Body: {
  "url": "https://example.com",
  "description": "Project resources"
}
```

## 🐛 Known Issues & Solutions

### Issue: TalkJS not loading
**Solution**: Verify App ID in `talkjs.config.js` and check browser console

### Issue: File upload not syncing
**Solution**: Ensure database schema is up to date, check API endpoints

### Issue: Checkbox selecting all items
**Solution**: Fixed in latest version - ensure `developer_id` field is present

## 🚀 Deployment

### Backend (Django)
- Deploy to Heroku, Railway, or AWS
- Set environment variables
- Run migrations
- Configure CORS settings

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Update API base URL
- Configure environment variables

### Database
- Supabase handles hosting
- Ensure connection pooling is configured
- Set up backups

## 📚 Documentation

- `TEAM_ASSIGNMENT_FEATURE.md` - Team assignment details
- `TALKJS_INTEGRATION_GUIDE.md` - TalkJS setup guide
- `FILE_SHARING_SCHEMA.sql` - File sharing database
- `COMMIT_SUMMARY.md` - Recent changes
- `GIT_COMMIT_GUIDE.md` - Git workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Authors

- Development Team - Initial work and features

## 🙏 Acknowledgments

- TalkJS for real-time chat infrastructure
- Supabase for backend services
- Sentence Transformers for AI matching
- React and Django communities

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation files

---

**Built with ❤️ for connecting developers and companies**
