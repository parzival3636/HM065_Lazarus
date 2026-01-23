import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const CompanyAssignedProjects = () => {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/company_assignments/`,
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

  const getSubmissionStatus = (assignment) => {
    if (!assignment.figma_submitted) return { text: 'Awaiting Figma', color: '#f59e0b' }
    if (!assignment.project_submitted) return { text: 'Awaiting Project', color: '#f59e0b' }
    if (assignment.submission?.approved === null) return { text: 'Under Review', color: '#6366f1' }
    if (assignment.submission?.approved) return { text: 'Approved', color: '#10b981' }
    return { text: 'Needs Revision', color: '#ef4444' }
  }

  if (loading) {
    return <div style={{ color: '#fff', padding: '2rem' }}>Loading assignments...</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#fff', marginBottom: '2rem', fontSize: '1.75rem', fontWeight: '700' }}>
        Assigned Projects
      </h2>

      {assignments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {assignments.map(assignment => {
            const status = getSubmissionStatus(assignment)

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
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '2rem',
                  alignItems: 'start',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>
                      {assignment.project_title}
                    </h3>
                    <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.95rem' }}>
                      Developer: {assignment.developer_name}
                    </p>
                  </div>
                  <div style={{
                    background: status.color + '20',
                    border: `1px solid ${status.color}40`,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: status.color,
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {status.text}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      FIGMA DESIGNS
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: assignment.figma_submitted ? '#10b981' : '#f59e0b'
                    }}>
                      {assignment.figma_submitted ? '✓ Submitted' : '⏳ Pending'}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      PROJECT SUBMISSION
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: assignment.project_submitted ? '#10b981' : '#f59e0b'
                    }}>
                      {assignment.project_submitted ? '✓ Submitted' : '⏳ Pending'}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      ASSIGNED
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#d4d4d8'
                    }}>
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => navigate(`/assignment/${assignment.id}/chat`)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    💬 View Chat
                  </button>

                  {assignment.project_submitted && assignment.submission?.approved === null && (
                    <button
                      onClick={() => navigate(`/assignment/${assignment.id}/review`)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '8px',
                        color: '#a78bfa',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Review Submission
                    </button>
                  )}

                  {assignment.submission?.approved === false && (
                    <button
                      onClick={() => navigate(`/assignment/${assignment.id}/chat`)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ⚠️ Awaiting Revision
                    </button>
                  )}
                </div>
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
            Assign developers to projects to see them here.
          </p>
        </div>
      )}
    </div>
  )
}

export default CompanyAssignedProjects
