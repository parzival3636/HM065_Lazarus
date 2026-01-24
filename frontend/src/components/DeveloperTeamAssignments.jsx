import { useState, useEffect } from 'react'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import TalkJSChat from './TalkJSChat'
import FileSharing from './FileSharing'
import { getTeamConversationId } from '../utils/talkjsHelpers'
import './Dashboard.css'
import './TeamChat.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const DeveloperTeamAssignments = () => {
  const [user, setUser] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  
  // File sharing state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [fileToUpload, setFileToUpload] = useState(null)
  const [linkToShare, setLinkToShare] = useState('')
  const [linkDescription, setLinkDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  
  // Submission forms
  const [figmaUrl, setFigmaUrl] = useState('')
  const [figmaImages, setFigmaImages] = useState([])
  const [submissionLinks, setSubmissionLinks] = useState({
    github: '',
    live_url: '',
    zip_file: '',
    documents: [],
    other: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
          await fetchAssignments()
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchAssignments = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/get_developer_team_assignments/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    }
  }

  const loadChat = async (assignmentId) => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${assignmentId}/get_team_chat/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setChatMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAssignment) return

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${selectedAssignment.id}/send_team_message/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: newMessage })
        }
      )

      if (response.ok) {
        setNewMessage('')
        loadChat(selectedAssignment.id)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const submitFigma = async () => {
    if (!figmaUrl.trim() && figmaImages.length === 0) {
      alert('Please enter a Figma URL or upload images')
      return
    }

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${selectedAssignment.id}/submit_figma/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            figma_url: figmaUrl,
            figma_images: figmaImages
          })
        }
      )

      if (response.ok) {
        alert('Figma submitted successfully!')
        setFigmaUrl('')
        setFigmaImages([])
        fetchAssignments()
        viewAssignmentDetails(selectedAssignment)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to submit Figma:', error)
      alert('Failed to submit Figma')
    }
  }

  const handleFigmaImageUpload = (e) => {
    const files = Array.from(e.target.files)
    // In a real app, you'd upload these to storage and get URLs
    // For now, we'll create temporary URLs
    const imageUrls = files.map(file => URL.createObjectURL(file))
    setFigmaImages([...figmaImages, ...imageUrls])
    alert('Note: In production, these images would be uploaded to cloud storage')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileToUpload(file)
    
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, create a temporary URL
    const fileUrl = URL.createObjectURL(file)
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl,
      uploadedBy: user.name || user.email,
      uploadedAt: new Date().toISOString()
    }

    setUploadedFiles([...uploadedFiles, fileData])
    setFileToUpload(null)
    e.target.value = '' // Reset input
    alert(`File "${file.name}" added! Note: In production, this would be uploaded to cloud storage.`)
  }

  const handleShareLink = () => {
    if (!linkToShare.trim()) {
      alert('Please enter a link')
      return
    }

    const linkData = {
      url: linkToShare,
      description: linkDescription || linkToShare,
      sharedBy: user.name || user.email,
      sharedAt: new Date().toISOString(),
      type: 'link'
    }

    setUploadedFiles([...uploadedFiles, linkData])
    setLinkToShare('')
    setLinkDescription('')
  }

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const submitProject = async () => {
    const hasAnyLink = Object.values(submissionLinks).some(link => link.trim())
    if (!hasAnyLink) {
      alert('Please provide at least one submission link')
      return
    }

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${selectedAssignment.id}/submit_project/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ submission_links: submissionLinks })
        }
      )

      if (response.ok) {
        alert('Project submitted successfully!')
        setSubmissionLinks({ github: '', live: '', documentation: '', other: '' })
        fetchAssignments()
        viewAssignmentDetails(selectedAssignment)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to submit project:', error)
      alert('Failed to submit project')
    }
  }

  const viewAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment)
    loadChat(assignment.id)
    
    // Pre-fill forms if already submitted
    if (assignment.my_figma_url) {
      setFigmaUrl(assignment.my_figma_url)
    }
    if (assignment.my_figma_images) {
      setFigmaImages(assignment.my_figma_images)
    }
    if (assignment.my_submission_links) {
      setSubmissionLinks({
        github: assignment.my_submission_links.github || '',
        live_url: assignment.my_submission_links.live_url || '',
        zip_file: assignment.my_submission_links.zip_file || '',
        documents: assignment.my_submission_links.documents || [],
        other: assignment.my_submission_links.other || ''
      })
    }
  }

  const calculateDaysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div className="dashboard-container">
      <Navbar user={user} />
      <div className="dashboard-wrapper">
        <h1 style={{color: '#374151', marginBottom: '2rem'}}>My Team Assignments</h1>

        {selectedAssignment ? (
          <div>
            <button 
              onClick={() => setSelectedAssignment(null)}
              className="btn btn-secondary"
              style={{marginBottom: '20px'}}
            >
              ← Back to All Assignments
            </button>

            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(102, 126, 234, 0.15)',
              padding: '20px',
              borderRadius: '20px',
              marginBottom: '20px',
              color: '#374151',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)'
            }}>
              <h2>{selectedAssignment.team_name}</h2>
              <p><strong>Project:</strong> {selectedAssignment.project_title}</p>
              <p><strong>Company:</strong> {selectedAssignment.company_name}</p>
              <p><strong>Type:</strong> {selectedAssignment.is_team ? '👥 Team Assignment' : '👤 Solo Assignment'}</p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginTop: '15px',
                padding: '15px',
                background: '#f8faff',
                borderRadius: '8px'
              }}>
                <div>
                  <strong>Figma Deadline:</strong>
                  <p>{new Date(selectedAssignment.figma_deadline).toLocaleDateString()}</p>
                  <p style={{color: '#f59e0b'}}>
                    {calculateDaysRemaining(selectedAssignment.figma_deadline)} days remaining
                  </p>
                </div>
                <div>
                  <strong>Project Deadline:</strong>
                  <p>{new Date(selectedAssignment.submission_deadline).toLocaleDateString()}</p>
                  <p style={{color: '#f59e0b'}}>
                    {calculateDaysRemaining(selectedAssignment.submission_deadline)} days remaining
                  </p>
                </div>
              </div>

              {selectedAssignment.is_team && (
                <div style={{marginTop: '20px'}}>
                  <h3>Team Members</h3>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px'}}>
                    {selectedAssignment.team_members.map((member) => (
                      <div key={member.developer_id} style={{
                        padding: '10px 15px',
                        background: '#f0f4ff',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '8px',
                        color: '#374151'
                      }}>
                        <strong>{member.name}</strong>
                        <p style={{fontSize: '12px', color: '#6b7280'}}>{member.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submission Forms */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Figma Submission */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(102, 126, 234, 0.15)',
                padding: '20px',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)',
                color: '#374151'
              }}>
                <h3 style={{marginBottom: '15px', color: '#374151'}}>📐 Figma Design Submission</h3>
                {selectedAssignment.my_figma_submitted ? (
                  <div style={{
                    padding: '15px',
                    background: '#d1fae5',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <p style={{color: '#065f46', fontWeight: 'bold', marginBottom: '10px'}}>✓ Submitted Successfully</p>
                    {selectedAssignment.my_figma_url && (
                      <a 
                        href={selectedAssignment.my_figma_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{color: '#059669', display: 'block', marginBottom: '10px'}}
                      >
                        🔗 View Figma Link
                      </a>
                    )}
                    {selectedAssignment.my_figma_images && selectedAssignment.my_figma_images.length > 0 && (
                      <div>
                        <p style={{color: '#065f46', fontSize: '14px', marginBottom: '8px'}}>
                          🖼️ {selectedAssignment.my_figma_images.length} image(s) uploaded
                        </p>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px'}}>
                          {selectedAssignment.my_figma_images.map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`Figma ${idx + 1}`}
                              style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px'}}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{marginTop: '15px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151'}}>
                      Figma URL
                    </label>
                    <input
                      type="text"
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      placeholder="https://www.figma.com/..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '14px'
                      }}
                    />
                    
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151'}}>
                      Or Upload Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFigmaImageUpload}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px dashed #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        cursor: 'pointer'
                      }}
                    />
                    {figmaImages.length > 0 && (
                      <div style={{marginBottom: '15px'}}>
                        <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '8px'}}>
                          {figmaImages.length} image(s) selected
                        </p>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px'}}>
                          {figmaImages.map((img, idx) => (
                            <div key={idx} style={{position: 'relative'}}>
                              <img 
                                src={img} 
                                alt={`Preview ${idx + 1}`}
                                style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px'}}
                              />
                              <button
                                onClick={() => setFigmaImages(figmaImages.filter((_, i) => i !== idx))}
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  right: '2px',
                                  background: 'rgba(239, 68, 68, 0.9)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={submitFigma} 
                      className="btn btn-primary" 
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        padding: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Submit Figma Design
                    </button>
                  </div>
                )}
              </div>

              {/* Project Submission */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(102, 126, 234, 0.15)',
                padding: '20px',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)',
                color: '#374151'
              }}>
                <h3 style={{marginBottom: '15px', color: '#374151'}}>🚀 Final Project Submission</h3>
                {selectedAssignment.my_project_submitted ? (
                  <div style={{
                    padding: '15px',
                    background: '#d1fae5',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <p style={{color: '#065f46', fontWeight: 'bold', marginBottom: '10px'}}>✓ Submitted Successfully</p>
                    {selectedAssignment.my_submission_links && (
                      <div style={{marginTop: '10px'}}>
                        {selectedAssignment.my_submission_links.github && (
                          <p style={{marginBottom: '8px'}}>
                            <a href={selectedAssignment.my_submission_links.github} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                              💻 GitHub Repository
                            </a>
                          </p>
                        )}
                        {selectedAssignment.my_submission_links.live_url && (
                          <p style={{marginBottom: '8px'}}>
                            <a href={selectedAssignment.my_submission_links.live_url} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                              🌐 Live Project
                            </a>
                          </p>
                        )}
                        {selectedAssignment.my_submission_links.zip_file && (
                          <p style={{marginBottom: '8px'}}>
                            <a href={selectedAssignment.my_submission_links.zip_file} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                              📦 ZIP File
                            </a>
                          </p>
                        )}
                        {selectedAssignment.my_submission_links.documents && selectedAssignment.my_submission_links.documents.length > 0 && (
                          <div style={{marginBottom: '8px'}}>
                            <p style={{color: '#065f46', fontWeight: '500'}}>📄 Documents:</p>
                            {selectedAssignment.my_submission_links.documents.map((doc, idx) => (
                              <p key={idx} style={{marginLeft: '15px', marginBottom: '4px'}}>
                                <a href={doc} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                                  Document {idx + 1}
                                </a>
                              </p>
                            ))}
                          </div>
                        )}
                        {selectedAssignment.my_submission_links.other && (
                          <p style={{marginBottom: '8px'}}>
                            <a href={selectedAssignment.my_submission_links.other} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                              🔗 Other Link
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{marginTop: '15px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151'}}>
                      💻 GitHub Repository URL
                    </label>
                    <input
                      type="text"
                      value={submissionLinks.github}
                      onChange={(e) => setSubmissionLinks({...submissionLinks, github: e.target.value})}
                      placeholder="https://github.com/username/repo"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '14px'
                      }}
                    />
                    
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151'}}>
                      🌐 Live Project URL
                    </label>
                    <input
                      type="text"
                      value={submissionLinks.live_url}
                      onChange={(e) => setSubmissionLinks({...submissionLinks, live_url: e.target.value})}
                      placeholder="https://your-project.com"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '14px'
                      }}
                    />
                    
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151'}}>
                      📦 ZIP File URL (optional)
                    </label>
                    <input
                      type="text"
                      value={submissionLinks.zip_file}
                      onChange={(e) => setSubmissionLinks({...submissionLinks, zip_file: e.target.value})}
                      placeholder="Link to ZIP file"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '14px'
                      }}
                    />
                    
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151'}}>
                      🔗 Other Links (optional)
                    </label>
                    <input
                      type="text"
                      value={submissionLinks.other}
                      onChange={(e) => setSubmissionLinks({...submissionLinks, other: e.target.value})}
                      placeholder="Any other relevant links"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '14px'
                      }}
                    />
                    
                    <p style={{fontSize: '13px', color: '#6b7280', marginBottom: '15px', fontStyle: 'italic'}}>
                      💡 Note: For file uploads (ZIP, PDFs), upload to a cloud service and paste the link here
                    </p>
                    
                    <button 
                      onClick={submitProject} 
                      className="btn btn-primary" 
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        padding: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Submit Final Project
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat and File Sharing Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Chat Section */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(102, 126, 234, 0.15)',
                padding: '20px',
                borderRadius: '20px',
                width: '100%',
                color: '#374151',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)'
              }}>
                <h3 style={{marginBottom: '15px', color: '#374151'}}>💬 Team Chat</h3>
                <TalkJSChat
                  currentUser={{
                    id: user.id,
                    name: user.name || user.email,
                    email: user.email,
                    user_type: 'developer',
                    skills: user.skills || [],
                    photo_url: user.photo_url || null
                  }}
                  conversationId={getTeamConversationId(selectedAssignment.id)}
                  conversationType="team"
                  participants={[
                    // Add all team members
                    ...(selectedAssignment.team_members || []).map(member => ({
                      id: member.developer_id,
                      name: member.name,
                      email: member.email,
                      user_type: 'developer',
                      photo_url: null
                    })),
                    // Add current developer user
                    {
                      id: user.id,
                      name: user.name || user.email,
                      email: user.email,
                      user_type: 'developer',
                      skills: user.skills || [],
                      photo_url: user.photo_url || null
                    }
                  ]}
                  conversationData={{
                    subject: `${selectedAssignment.team_name} - ${selectedAssignment.project_title}`,
                    welcomeMessage: `Welcome to ${selectedAssignment.team_name}! Let's build ${selectedAssignment.project_title} together.`,
                    projectId: selectedAssignment.project_id,
                    teamName: selectedAssignment.team_name,
                    photoUrl: 'https://ui-avatars.com/api/?name=Team&background=667eea&color=fff'
                  }}
                  height="600px"
                />
              </div>

              {/* File Sharing Section */}
              <FileSharing
                assignmentId={selectedAssignment.id}
                onFileShared={(data) => {
                  console.log('File shared:', data)
                  // You can add logic here to notify team members via chat
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            {assignments.length > 0 ? (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
                {assignments.map((assignment) => (
                  <div key={assignment.id} style={{
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    padding: '20px',
                    borderRadius: '20px',
                    background: '#ffffff',
                    color: '#374151',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)'
                  }}>
                    <h3>{assignment.team_name}</h3>
                    <p><strong>Project:</strong> {assignment.project_title}</p>
                    <p><strong>Company:</strong> {assignment.company_name}</p>
                    <p><strong>Type:</strong> {assignment.is_team ? '👥 Team' : '👤 Solo'}</p>
                    
                    <div style={{
                      marginTop: '15px',
                      padding: '10px',
                      background: '#f8faff',
                      borderRadius: '8px'
                    }}>
                      <p><strong>My Status:</strong></p>
                      <p>
                        Figma: {assignment.my_figma_submitted ? 
                          <span style={{color: 'green'}}>✓ Submitted</span> : 
                          <span style={{color: 'orange'}}>⏳ Pending</span>
                        }
                      </p>
                      <p>
                        Project: {assignment.my_project_submitted ? 
                          <span style={{color: 'green'}}>✓ Submitted</span> : 
                          <span style={{color: 'orange'}}>⏳ Pending</span>
                        }
                      </p>
                    </div>

                    <div style={{marginTop: '10px', fontSize: '14px', color: '#6b7280'}}>
                      <p>Figma due: {calculateDaysRemaining(assignment.figma_deadline)} days</p>
                      <p>Project due: {calculateDaysRemaining(assignment.submission_deadline)} days</p>
                    </div>

                    <button
                      onClick={() => viewAssignmentDetails(assignment)}
                      className="btn btn-primary"
                      style={{marginTop: '15px', width: '100%'}}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No team assignments yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeveloperTeamAssignments