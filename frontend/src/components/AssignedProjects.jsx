import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const AssignedProjects = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetchData()
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/developer_assignments/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const days = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const getDeadlineStatus = (days) => {
    if (days <= 0) return { color: '#ef4444', text: 'Overdue' }
    if (days <= 3) return { color: '#f59e0b', text: `${days} days left` }
    return { color: '#10b981', text: `${days} days left` }
  }

  if (loading) {
    return <div style={{ color: '#fff', padding: '2rem' }}>Loading assignments...</div>
  }

  return (
    <div>
      <Navbar user={user} />
      <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#fff', marginBottom: '2rem', fontSize: '1.75rem', fontWeight: '700' }}>
        Assigned Projects
      </h2>

      {assignments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {assignments.map(assignment => {
            const figmaStatus = getDeadlineStatus(assignment.figma_days_remaining)
            const submissionStatus = getDeadlineStatus(assignment.submission_days_remaining)

            return (
              <div
                key={assignment.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '2rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Project Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>
                    {assignment.project_title}
                  </h3>
                  <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.95rem' }}>
                    Company: {assignment.company_name}
                  </p>
                </div>

                {/* Deadlines Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {/* Figma Deadline */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      FIGMA DESIGNS DEADLINE
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: figmaStatus.color,
                      marginBottom: '0.5rem'
                    }}>
                      {figmaStatus.text}
                    </div>
                    <div style={{ color: '#71717a', fontSize: '0.875rem' }}>
                      {new Date(assignment.figma_deadline).toLocaleDateString()}
                    </div>
                    {!assignment.figma_submitted && (
                      <button
                        onClick={() => navigate(`/assignment/${assignment.id}/figma`)}
                        style={{
                          marginTop: '1rem',
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                        }}
                      >
                        Submit Figma
                      </button>
                    )}
                    {assignment.figma_submitted && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        color: '#10b981',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        ✓ Submitted
                      </div>
                    )}
                  </div>

                  {/* Project Submission Deadline */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      PROJECT SUBMISSION DEADLINE
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: submissionStatus.color,
                      marginBottom: '0.5rem'
                    }}>
                      {submissionStatus.text}
                    </div>
                    <div style={{ color: '#71717a', fontSize: '0.875rem' }}>
                      {new Date(assignment.submission_deadline).toLocaleDateString()}
                    </div>
                    {!assignment.project_submitted && (
                      <button
                        onClick={() => navigate(`/assignment/${assignment.id}/submit`)}
                        style={{
                          marginTop: '1rem',
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                        }}
                      >
                        Submit Project
                      </button>
                    )}
                    {assignment.project_submitted && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        color: '#10b981',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        ✓ Submitted
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Button */}
                <button
                  onClick={() => navigate(`/assignment/${assignment.id}/chat`)}
                  style={{
                    padding: '0.875rem 1.75rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  💬 Open Chat
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          color: '#a1a1aa'
        }}>
          <p style={{ fontSize: '1.125rem', margin: 0 }}>No assigned projects yet.</p>
          <p style={{ fontSize: '0.95rem', margin: '0.5rem 0 0 0', color: '#71717a' }}>
            When a company assigns you a project, it will appear here.
          </p>
        </div>
      )}
      </div>
    </div>
  )
}

export default AssignedProjects
