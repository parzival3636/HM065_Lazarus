# Complete Project Assignment Workflow

## Overview
This document outlines the complete workflow for assigning projects, managing chats, and handling submissions.

## Database Models Created

### 1. ProjectAssignment
- Links a project to a developer
- Tracks assignment dates and deadlines
- Manages Figma design submission status
- Manages final project submission status

**Key Fields:**
- `project` - OneToOne to Project
- `developer` - ForeignKey to User
- `application` - OneToOne to ProjectApplication
- `assigned_at` - When project was assigned
- `figma_deadline` - 1 week from assignment (auto-calculated)
- `submission_deadline` - 30 days from assignment (auto-calculated)
- `figma_submitted` - Boolean flag
- `project_submitted` - Boolean flag

### 2. ProjectChat
- One chat per assigned project
- Links to ProjectAssignment
- Contains multiple ChatMessages

### 3. ChatMessage
- Individual messages in chat
- Supports text, system messages, and files
- Can have multiple attachments (PDFs, images, etc.)
- Tracks sender and timestamp

**Message Types:**
- `text` - Regular message
- `system` - Automated messages (e.g., "Congratulations...")
- `file` - File sharing

### 4. FigmaDesignSubmission
- Stores Figma design URL
- 1 week deadline from assignment
- OneToOne relationship with ProjectAssignment

### 5. ProjectSubmission
- Final project submission
- Rich text description
- Multiple link types:
  - Documentation (PDFs)
  - GitHub repos
  - Live projects
  - Additional links
- Company review status (pending/approved/rejected)

## Workflow Steps

### Step 1: Company Assigns Project
**Endpoint:** `POST /api/projects/{application_id}/assign/`

**Request:**
```json
{
  "application_id": 123
}
```

**Response:**
```json
{
  "assignment_id": 456,
  "project": {...},
  "developer": {...},
  "figma_deadline": "2026-01-25T...",
  "submission_deadline": "2026-02-18T...",
  "chat_created": true
}
```

**Backend Actions:**
1. Create ProjectAssignment
2. Create ProjectChat
3. Create initial system message: "Congratulations! You have been selected for this project."
4. Update ProjectApplication status to 'selected'
5. Update Project status to 'in_progress'

### Step 2: Chat Interface
**Endpoints:**
- `GET /api/assignments/{assignment_id}/chat/` - Get all messages
- `POST /api/assignments/{assignment_id}/chat/message/` - Send message
- `POST /api/assignments/{assignment_id}/chat/upload/` - Upload file

**Message Structure:**
```json
{
  "id": 1,
  "sender": "John Doe",
  "sender_type": "developer",
  "message": "Here's my initial design",
  "message_type": "text",
  "attachments": [
    {
      "url": "https://...",
      "type": "pdf",
      "name": "design.pdf"
    }
  ],
  "created_at": "2026-01-18T..."
}
```

**Supported File Types:**
- PDFs
- Images (PNG, JPG, GIF)
- Figma links
- Any document

### Step 3: Figma Design Submission (1 Week)
**Endpoint:** `POST /api/assignments/{assignment_id}/figma-submit/`

**Request:**
```json
{
  "figma_url": "https://figma.com/...",
  "description": "Initial design mockups"
}
```

**Response:**
```json
{
  "submission_id": 789,
  "figma_url": "https://figma.com/...",
  "submitted_at": "2026-01-20T...",
  "days_remaining": 27
}
```

**Backend Actions:**
1. Create FigmaDesignSubmission
2. Update ProjectAssignment.figma_submitted = True
3. Send system message to chat: "Figma designs submitted"
4. Company can now view designs in chat or dedicated section

### Step 4: Final Project Submission (30 Days)
**Endpoint:** `POST /api/assignments/{assignment_id}/submit/`

**Request:**
```json
{
  "description": "<rich_html_content>",
  "documentation_links": [
    "https://docs.pdf"
  ],
  "github_links": [
    "https://github.com/repo"
  ],
  "project_links": [
    "https://live-project.com"
  ],
  "additional_links": [
    "https://other-link.com"
  ]
}
```

**Response:**
```json
{
  "submission_id": 999,
  "status": "submitted",
  "submitted_at": "2026-02-10T...",
  "company_review_pending": true
}
```

**Backend Actions:**
1. Create ProjectSubmission
2. Update ProjectAssignment.project_submitted = True
3. Send system message: "Project submitted for review"
4. Notify company

### Step 5: Company Reviews Submission
**Endpoint:** `POST /api/assignments/{assignment_id}/review/`

**Request:**
```json
{
  "approved": true,
  "feedback": "Great work! Minor adjustments needed..."
}
```

**Response:**
```json
{
  "submission_id": 999,
  "approved": true,
  "reviewed_at": "2026-02-11T...",
  "feedback": "Great work!..."
}
```

**Backend Actions:**
1. Update ProjectSubmission.approved
2. Update ProjectSubmission.company_feedback
3. Update Project.status to 'completed' if approved
4. Send system message to chat with feedback

## Frontend Components Needed

### 1. AssignProjectButton (Company Dashboard)
- Located in ApplicationsView
- Triggers assignment workflow
- Shows confirmation dialog

### 2. AssignedProjectsSection (Developer Dashboard)
- Lists all assigned projects
- Shows:
  - Project title
  - Figma deadline (with countdown)
  - Submission deadline (with countdown)
  - Chat button
  - Submission button

### 3. ProjectChatInterface
- Real-time chat between company and developer
- File upload support
- Message history
- Figma design preview
- Submission preview

### 4. FigmaDesignSubmissionForm
- Figma URL input
- Description textarea
- Submit button
- Deadline countdown

### 5. ProjectSubmissionForm
- Rich text editor for description
- PDF upload for documentation
- GitHub link input
- Project link input
- Additional links (+ button to add more)
- Submit button
- Deadline countdown

### 6. SubmissionReviewPanel (Company)
- View submitted project
- View all links
- Rich text description
- Approve/Reject buttons
- Feedback textarea

## Timelines

### Figma Design Deadline
- **Duration:** 1 week from assignment
- **Auto-calculated:** `assigned_at + 7 days`
- **Countdown:** Shown on developer dashboard
- **Status:** figma_submitted flag

### Project Submission Deadline
- **Duration:** 30 days from assignment
- **Auto-calculated:** `assigned_at + 30 days`
- **Countdown:** Shown on developer dashboard
- **Status:** project_submitted flag

## Chat Features

### Message Types
1. **Text Messages** - Regular communication
2. **System Messages** - Automated (congratulations, submission notifications)
3. **File Messages** - PDFs, images, documents

### File Support
- PDFs (documentation)
- Images (screenshots, designs)
- Any file type (links)
- Figma links (embedded preview)

### Participants
- Company representative
- Developer
- System (for automated messages)

## API Endpoints Summary

```
POST   /api/projects/{application_id}/assign/
GET    /api/assignments/{assignment_id}/
GET    /api/assignments/{assignment_id}/chat/
POST   /api/assignments/{assignment_id}/chat/message/
POST   /api/assignments/{assignment_id}/chat/upload/
POST   /api/assignments/{assignment_id}/figma-submit/
GET    /api/assignments/{assignment_id}/figma/
POST   /api/assignments/{assignment_id}/submit/
GET    /api/assignments/{assignment_id}/submission/
POST   /api/assignments/{assignment_id}/review/
GET    /api/developer/assigned-projects/
GET    /api/company/assigned-projects/
```

## Status Flow

```
Application (pending)
    ↓
Application (selected) + ProjectAssignment created
    ↓
Chat initialized with congratulations message
    ↓
Developer submits Figma designs (1 week deadline)
    ↓
Company reviews designs in chat
    ↓
Developer submits final project (30 days deadline)
    ↓
Company reviews submission
    ↓
Project (completed) or back to developer for revisions
```

## Key Features

✅ Automated congratulations message on assignment
✅ 1-week Figma design deadline with countdown
✅ 30-day project submission deadline with countdown
✅ Real-time chat with file sharing
✅ Rich text editor for submissions
✅ Multiple link types (GitHub, docs, live projects)
✅ Company review and feedback system
✅ Dedicated sections for each phase
✅ Countdown timers on developer dashboard
✅ Submission tracking and status updates

## Next Steps

1. Create API endpoints in `backend/projects/api_views.py`
2. Create serializers for all models
3. Create frontend components for each phase
4. Implement real-time chat (WebSocket or polling)
5. Add file upload handling
6. Add countdown timer logic
7. Add notifications system
