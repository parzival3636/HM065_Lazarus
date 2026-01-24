import { useState, useEffect } from 'react'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import TalkJSChat from './TalkJSChat'
import FileSharing from './FileSharing'
import { getTeamConversationId } from '../utils/talkjsHelpers'
import './Dashboard.css'
import './TeamChat.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const CompanyTeamAssignments = () => {
  const [user, setUser] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [editingDeadlines, setEditingDeadlines] = useState(false)
  const [newFigmaDeadline, setNewFigmaDeadline] = useState('')
  const [newSubmissionDeadline, setNewSubmissionDeadline] = useState('')

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
        `${API_BASE_URL}/projects/team-assignments/get_team_assignments/`,
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

  const viewAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment)
    loadChat(assignment.id)
    setNewFigmaDeadline(assignment.figma_deadline.split('T')[0])
    setNewSubmissionDeadline(assignment.submission_deadline.split('T')[0])
  }

  const updateDeadlines = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${selectedAssignment.id}/update_deadlines/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            figma_deadline: newFigmaDeadline,
            submission_deadline: newSubmissionDeadline
          })
        }
      )

      if (response.ok) {
        alert('Deadlines updated successfully!')
        setEditingDeadlines(false)
        fetchAssignments()
      }
    } catch (error) {
      console.error('Failed to update deadlines:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <h1>Team Assignments</h1>

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
              background: 'rgba(0, 0, 0, 0.85)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#ffffff'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>{selectedAssignment.team_name}</h2>
                <button 
                  onClick={() => setEditingDeadlines(!editingDeadlines)}
                  className="btn btn-secondary"
                >
                  {editingDeadlines ? 'Cancel' : '📅 Edit Deadlines'}
                </button>
              </div>
              
              <p><strong>Project:</strong> {selectedAssignment.project_title}</p>
              <p><strong>Type:</strong> {selectedAssignment.is_team ? 'Team Assignment' : 'Single Developer'}</p>
              
              {editingDeadlines ? (
                <div style={{
                  background: '#f0f9ff',
                  padding: '20px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h3>Update Deadlines</h3>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Figma Deadline
                      </label>
                      <input
                        type="date"
                        value={newFigmaDeadline}
                        onChange={(e) => setNewFigmaDeadline(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Submission Deadline
                      </label>
                      <input
                        type="date"
                        value={newSubmissionDeadline}
                        onChange={(e) => setNewSubmissionDeadline(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={updateDeadlines}
                    className="btn btn-primary"
                    style={{marginTop: '15px'}}
                  >
                    Save Deadlines
                  </button>
                </div>
              ) : (
                <div>
                  <p><strong>Figma Deadline:</strong> {new Date(selectedAssignment.figma_deadline).toLocaleDateString()}</p>
                  <p><strong>Submission Deadline:</strong> {new Date(selectedAssignment.submission_deadline).toLocaleDateString()}</p>
                </div>
              )}

              <h3 style={{marginTop: '20px'}}>Team Members</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '15px'}}>
                {selectedAssignment.members.map((member) => (
                  <div key={member.developer_id} style={{
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '15px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff'
                  }}>
                    <h4>{member.name}</h4>
                    <p style={{fontSize: '14px', color: '#666'}}>{member.email}</p>
                    
                    <div style={{marginTop: '10px'}}>
                      <p>
                        <strong>Figma:</strong>{' '}
                        {member.figma_submitted ? (
                          <span style={{color: 'green'}}>
                            ✓ Submitted
                            {member.figma_url && (
                              <a href={member.figma_url} target="_blank" rel="noopener noreferrer" style={{marginLeft: '10px', color: '#059669'}}>
                                View Link
                              </a>
                            )}
                            {member.figma_images && member.figma_images.length > 0 && (
                              <span style={{marginLeft: '10px', fontSize: '12px'}}>
                                🖼️ {member.figma_images.length} image(s)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{color: 'orange'}}>⏳ Pending</span>
                        )}
                      </p>
                      <p>
                        <strong>Project:</strong>{' '}
                        {member.project_submitted ? (
                          <span style={{color: 'green'}}>✓ Submitted</span>
                        ) : (
                          <span style={{color: 'orange'}}>⏳ Pending</span>
                        )}
                      </p>
                      
                      {member.submission_links && Object.keys(member.submission_links).length > 0 && (
                        <div style={{marginTop: '10px'}}>
                          <strong>Submission Links:</strong>
                          <ul style={{marginTop: '5px', paddingLeft: '20px', fontSize: '14px'}}>
                            {member.submission_links.github && (
                              <li>
                                <a href={member.submission_links.github} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                                  💻 GitHub Repository
                                </a>
                              </li>
                            )}
                            {member.submission_links.live_url && (
                              <li>
                                <a href={member.submission_links.live_url} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                                  🌐 Live Project
                                </a>
                              </li>
                            )}
                            {member.submission_links.zip_file && (
                              <li>
                                <a href={member.submission_links.zip_file} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                                  📦 ZIP File
                                </a>
                              </li>
                            )}
                            {member.submission_links.documents && member.submission_links.documents.length > 0 && (
                              <li>
                                📄 Documents ({member.submission_links.documents.length})
                                <ul style={{marginTop: '5px'}}>
                                  {member.submission_links.documents.map((doc, idx) => (
                                    <li key={idx}>
                                      <a href={doc} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                                        Document {idx + 1}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            )}
                            {member.submission_links.documentation && (
                              <li>
                                <a href={member.submission_links.documentation} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                                  📖 Documentation
                                </a>
                              </li>
                            )}
                            {member.submission_links.other && (
                              <li>
                                <a href={member.submission_links.other} target="_blank" rel="noopener noreferrer" style={{color: '#059669'}}>
                                  🔗 Other Link
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                background: 'rgba(0, 0, 0, 0.85)',
                padding: '20px',
                borderRadius: '8px',
                width: '100%',
                color: '#ffffff'
              }}>
                <h3 style={{marginBottom: '15px', color: '#ffffff'}}>💬 Team Chat</h3>
                <TalkJSChat
                  currentUser={{
                    id: user.id,
                    name: user.name || user.email,
                    email: user.email,
                    user_type: 'company',
                    company_name: user.company_name || 'Company',
                    photo_url: user.photo_url || null
                  }}
                  conversationId={getTeamConversationId(selectedAssignment.id)}
                  conversationType="team"
                  participants={[
                    // Add all team members
                    ...selectedAssignment.members.map(member => ({
                      id: member.developer_id,
                      name: member.name,
                      email: member.email,
                      user_type: 'developer',
                      photo_url: null
                    })),
                    // Add current company user
                    {
                      id: user.id,
                      name: user.name || user.email,
                      email: user.email,
                      user_type: 'company',
                      company_name: user.company_name || 'Company',
                      photo_url: user.photo_url || null
                    }
                  ]}
                  conversationData={{
                    subject: `${selectedAssignment.team_name} - ${selectedAssignment.project_title}`,
                    welcomeMessage: `Welcome to ${selectedAssignment.team_name}! Collaborate on ${selectedAssignment.project_title}.`,
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
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '20px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#ffffff'
                  }}>
                    <h3>{assignment.team_name}</h3>
                    <p><strong>Project:</strong> {assignment.project_title}</p>
                    <p><strong>Type:</strong> {assignment.is_team ? '👥 Team' : '👤 Solo'}</p>
                    <p><strong>Members:</strong> {assignment.members.length}</p>
                    
                    <div style={{marginTop: '15px'}}>
                      <p><strong>Submissions:</strong></p>
                      <p>
                        Figma: {assignment.members.filter(m => m.figma_submitted).length}/{assignment.members.length}
                      </p>
                      <p>
                        Project: {assignment.members.filter(m => m.project_submitted).length}/{assignment.members.length}
                      </p>
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

export default CompanyTeamAssignments
