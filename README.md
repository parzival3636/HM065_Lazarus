**[HM065] [Lazarus]**  
# **DevConnect - AI-Powered Freelancer Matching Platform**  

## **📌 Purpose of the Website**  
DevConnect is an intelligent freelancer matching platform that uses advanced AI and machine learning to connect companies with the most suitable developers and designers for their projects. The platform features a sophisticated matching engine that analyzes 114+ features to rank freelancers based on skill compatibility, experience fit, and project requirements.

### **How It Works?**  
- Companies post detailed project requirements with tech stack and budget information
- Freelancers apply with proposals, portfolios, and rate expectations
- AI matching engine analyzes applications using BERT embeddings and ensemble ML models
- Top 5 most suitable freelancers are ranked with transparent scoring breakdown
- Companies can review detailed match analysis and make informed hiring decisions
- Integrated project management system handles assignments, submissions, and payments

### **How It Helps the Institute?**  
- Reduces hiring time by 80% through intelligent pre-screening and ranking
- Improves project success rates with better freelancer-project matching
- Provides transparent, data-driven hiring decisions with detailed analytics
- Streamlines project workflow from posting to completion with integrated tools
- Ensures fair compensation and transparent processes for all participants

---

## Considerations to keep in mind:
The backend is deployed on **Render (Free Tier)** and includes **ML-based inference endpoints**.
Due to **free-tier resource and execution time constraints**, the service may **cold-start or temporarily time out** during initial requests after inactivity.

This behavior is expected in serverless/free-tier environments and **does not indicate any issue with the backend logic, API design, or ML pipeline**.

## **🌟 Features**  

✔ **AI-Powered Matching** - BERT embeddings and ensemble ML models for intelligent freelancer ranking  
✔ **Smart Skill Analysis** - Identifies matching, missing, and extra skills with gap analysis  
✔ **Portfolio Intelligence** - Analyzes past projects for relevance and quality assessment  
✔ **Proposal Quality Scoring** - Evaluates cover letters and application depth  
✔ **Budget Alignment** - Matches freelancer rates with project budgets  
✔ **Transparent Scoring** - 5-component breakdown (Skill Match, Experience, Portfolio, Proposal, Rate Fit)  
✔ **Real-time Rankings** - Top 5 freelancers ranked with 0-100 match scores  
✔ **Project Management** - Integrated workflow for assignments, submissions, and reviews  
✔ **Developer Portfolios** - Showcase projects with tech stack and visual presentations  
✔ **Secure Authentication** - Role-based access for companies and freelancers  
✔ **Responsive Design** - Optimized for desktop, tablet, and mobile devices  
✔ **RESTful API** - Complete API for frontend integration and third-party connections  

### For Developers
- Browse and apply to projects
- View personalized project recommendations
- Manage portfolio with project showcases
- Track assigned projects with deadline countdowns
- Submit Figma designs and final projects
- Real-time chat with companies
- View earnings and project history

### For Companies
- Post projects with detailed requirements
- View ranked applications with AI match scores
- Assign projects to selected developers
- Real-time communication with assigned developers
- Review and approve/reject submissions
- Track all assigned projects


### AI/ML Features
- **Skill Matching**: Compares required skills with developer skills (35% weight)
- **Experience Fit**: Evaluates years of experience (25% weight)
- **Portfolio Quality**: Considers developer ratings (20% weight)
- **Proposal Quality**: Analyzes cover letter depth (15% weight)
- **Rate Fit**: Matches proposed rate with budget (5% weight)
  

## **🖼️ Screenshots**  
Here are some screenshots showcasing the DevConnect platform:  


**🔹 Landing Page**  
<img width="1918" height="976" alt="image" src="https://github.com/user-attachments/assets/02fe8d14-4740-4253-929a-a4f95c7e0dfb" /> 

**🔹 Project Dashboard**  
<img width="1918" height="888" alt="image" src="https://github.com/user-attachments/assets/0af4149e-b7f8-409c-bf46-1e0b040ea97a" />  

  

**🔹 Match Analysis**  
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/faf78de1-eac9-4f0e-bfbd-2afefdbd661d" />

  

---

## **🌍 Deployed URL**  
🔗 **[Access the Live Platform](https://hm-065-lazarus-v22l.vercel.app/)**  

---

## **🎥 Demo Video**  
📽️ **[Watch the Demo]
---

## **🛠️ Tech Stack & APIs Used**  

- **Frontend:** React.js, Vite, React Router DOM  
- **Backend:** Django 5.1.5, Django REST Framework  
- **Database:** PostgreSQL with SQLite for development  
- **AI/ML:** BERT Embeddings (Sentence Transformers), Scikit-learn, PyTorch  
- **Machine Learning:** Gradient Boosting, Random Forest, Feature Scaling  
- **Authentication:** Django Authentication System  
- **API:** RESTful API with Django REST Framework  
- **Deployment:** Docker-ready configuration  
- **Version Control:** Git with comprehensive documentation  

---

**System Architecture**
<img width="2895" height="2087" alt="image" src="https://github.com/user-attachments/assets/b7ef213a-c5c1-4e28-9d96-8e8a89e03757" />

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL (via Supabase)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
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
Create `.env` file in backend directory:
```
DEBUG=True
SECRET_KEY=your_secret_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_db_password
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Start backend server**
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

3. **Start development server**
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

4. **Build for production**
```bash
npm run build
```
### Model Training

Models are trained on historical application data with labels indicating successful matches. The training pipeline:

1. Feature extraction from applications
2. Feature scaling using StandardScaler
3. Binning scores into 4 categories (0-25, 25-50, 50-75, 75-100)
4. Training both classifiers
5. Ensemble prediction with weighted averaging

## **🚀 Upcoming Features**  

🔹 **Advanced Analytics:** Detailed project success metrics and insights  
🔹 **Multi-language Support:** Platform localization for global users  
🔹 **Mobile App:** Native iOS and Android applications  
🔹 **Blockchain Payments:** Cryptocurrency payment integration  
🔹 **Team Collaboration:** Multi-freelancer project assignments  
🔹 **AI Chatbot:** Intelligent project requirement assistance  

---


## File Structure

```
HM065_Lazarus/
├── backend/
│   ├── devconnect/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── serializers.py
│   ├── projects/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── api_views.py
│   │   ├── assignment_views.py
│   │   ├── matcher.py
│   │   ├── urls.py
│   │   └── serializers.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── DeveloperRegister.jsx
│   │   │   ├── CompanyRegister.jsx
│   │   │   ├── ProjectBrowser.jsx
│   │   │   ├── ApplicationsView.jsx
│   │   │   ├── AssignedProjects.jsx
│   │   │   ├── ProjectChatInterface.jsx
│   │   │   ├── FigmaSubmissionForm.jsx
│   │   │   ├── ProjectSubmissionForm.jsx
│   │   │   ├── SubmissionReviewPanel.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```



## Usage Examples

### Register as Developer
1. Go to `http://localhost:5173`
2. Click "Register as Developer"
3. Fill in email, password, name, skills, experience
4. Submit

### Register as Company
1. Go to `http://localhost:5173`
2. Click "Register as Company"
3. Fill in email, password, company name, industry
4. Submit

### Post a Project (Company)
1. Login as company
2. Go to Dashboard → Post Project
3. Fill in project details, tech stack, budget, timeline
4. Submit

### Apply to Project (Developer)
1. Login as developer
2. Browse Projects
3. Click on project and fill application form
4. Submit

### Assign Project (Company)
1. Go to My Projects → View Applications
2. See ranked applications with AI scores
3. Click "Assign Project" on best candidate
4. Developer receives notification

### Submit Figma Designs (Developer)
1. Go to Assigned Projects
2. Click on project
3. Click "Submit Figma Designs"
4. Enter Figma URL and description
5. Submit

### Submit Final Project (Developer)
1. After Figma submission, click "Submit Final Project"
2. Fill in description and add links
3. Submit

### Review Submission (Company)
1. Go to Assigned Projects
2. Click "Review Submission"
3. View submission details
4. Approve or request revisions

## Performance Considerations

- **ML Scoring**: Runs asynchronously when application is created
- **Chat Polling**: Frontend polls every 3 seconds for new messages
- **Database Indexing**: Indexes on frequently queried fields (user_id, project_id, status)
- **Caching**: Session tokens cached in localStorage



**Team Lazarus**  
 
🔗 *[GitHub Organization](https://github.com/parzival3636/HM065_Lazarus)*  



🚀 **Thank You for Using DevConnect!**  
We hope this AI-powered platform revolutionizes how companies find and hire the perfect freelancers for their projects. 🤖
