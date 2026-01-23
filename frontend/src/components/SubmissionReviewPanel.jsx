import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const SubmissionReviewPanel = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/${assignmentId}/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
        if (data.submission?.company_feedback) {
          setFeedback(data.submission.company_feedback)
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (approved) => {
    setReviewing(true)
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/${assignmentId}/review_submission/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approved: approved,
            feedback: feedback
          })
        }
      )

      if (response.ok) {
        alert(approved ? 'Project approved!' : 'Feedback sent to developer')
        navigate(`/assignment/${assignmentId}/chat`)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to review'}`)
      }
    } catch (error) {
      console.error('Error reviewing:', error)
      alert('Failed to submit review')
    } finally {
      setReviewing(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        Loading submission...
      </div>
    )
  }

  if (!assignment?.submission) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          color: '#a1a1aa'
        }}>
          <p style={{ fontSize: '1.125rem', margin: 0 }}>No submission yet.</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isReviewed = assignment.submission.approved !== null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            ← Back
          </button>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#fff',
            margin: '0 0 1rem 0',
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Review Submission
          </h1>

          <p style={{ color: '#a1a1aa', fontSize: '1.05rem', margin: 0 }}>
            Project: {assignment.project_title} • Developer: {assignment.developer_name}
          </p>
        </div>

        {/* Submission Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>
              Project Description
            </h3>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#d4d4d8',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {assignment.submission.description}
            </div>
          </div>

          {/* Links */}
          {(assignment.submission.documentation_links?.length > 0 ||
            assignment.submission.github_links?.length > 0 ||
            assignment.submission.project_links?.length > 0 ||
            assignment.submission.additional_links?.length > 0) && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>
                Project Links
              </h3>

              {assignment.submission.documentation_links?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                    📄 Documentation
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {assignment.submission.documentation_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#a78bfa',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(99, 102, 241, 0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(99, 102, 241, 0.1)'
                        }}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {assignment.submission.github_links?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                    💻 GitHub Repositories
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {assignment.submission.github_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#a78bfa',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {assignment.submission.project_links?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                    🚀 Live Projects
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {assignment.submission.project_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#a78bfa',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {assignment.submission.additional_links?.length > 0 && (
                <div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                    🔗 Additional Links
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {assignment.submission.additional_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#a78bfa',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Section */}
        {!isReviewed ? (
          <form style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>
              Your Feedback
            </h3>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback or reasons for approval/rejection..."
              rows="6"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1.5rem'
              }}
            />

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReview(false)}
                disabled={reviewing}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  fontWeight: '600',
                  cursor: reviewing ? 'not-allowed' : 'pointer',
                  opacity: reviewing ? 0.7 : 1
                }}
              >
                {reviewing ? 'Sending...' : 'Request Revision'}
              </button>
              <button
                type="button"
                onClick={() => handleReview(true)}
                disabled={reviewing}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: reviewing ? 'not-allowed' : 'pointer',
                  opacity: reviewing ? 0.7 : 1
                }}
              >
                {reviewing ? 'Approving...' : 'Approve Project'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{
            background: assignment.submission.approved
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: assignment.submission.approved
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {assignment.submission.approved ? '✓' : '⚠️'}
            </div>
            <h2 style={{
              color: assignment.submission.approved ? '#10b981' : '#ef4444',
              margin: '0 0 1rem 0'
            }}>
              {assignment.submission.approved ? 'Project Approved' : 'Revision Requested'}
            </h2>
            {assignment.submission.company_feedback && (
              <p style={{ color: '#a1a1aa', margin: 0, lineHeight: '1.6' }}>
                {assignment.submission.company_feedback}
              </p>
            )}
            <button
              onClick={() => navigate(`/assignment/${assignmentId}/chat`)}
              style={{
                marginTop: '1.5rem',
                padding: '0.875rem 2rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubmissionReviewPanel
