import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const FigmaSubmissionForm = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [figmaUrl, setFigmaUrl] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(0)

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/assignments/${assignmentId}/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
        setDaysRemaining(data.figma_days_remaining)
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/assignments/${assignmentId}/submit_figma/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            figma_url: figmaUrl,
            description: description
          })
        }
      )

      if (response.ok) {
        alert('Figma designs submitted successfully!')
        navigate(`/assignment/${assignmentId}/chat`)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to submit'}`)
      }
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Failed to submit Figma designs')
    } finally {
      setSubmitting(false)
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
        Loading...
      </div>
    )
  }

  const getDeadlineColor = () => {
    if (daysRemaining <= 0) return '#ef4444'
    if (daysRemaining <= 3) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            Submit Figma Designs
          </h1>

          <p style={{ color: '#a1a1aa', fontSize: '1.05rem', margin: 0 }}>
            Project: {assignment?.project_title}
          </p>
        </div>

        {/* Deadline Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                DEADLINE
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: getDeadlineColor()
              }}>
                {daysRemaining} days
              </div>
              <div style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {new Date(assignment?.figma_deadline).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                STATUS
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: assignment?.figma_submitted ? '#10b981' : '#f59e0b'
              }}>
                {assignment?.figma_submitted ? '✓ Submitted' : 'Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {!assignment?.figma_submitted ? (
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            {/* Figma URL */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '0.95rem'
              }}>
                Figma URL *
              </label>
              <input
                type="url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://figma.com/file/..."
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
              <p style={{ color: '#71717a', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                Share your Figma design file link
              </p>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '0.95rem'
              }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your design approach, key features, and design decisions..."
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
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            {/* Buttons */}
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
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !figmaUrl}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting || !figmaUrl ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Figma Designs'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ color: '#10b981', margin: '0 0 1rem 0' }}>Figma Designs Submitted</h2>
            <p style={{ color: '#a1a1aa', margin: 0 }}>
              Your designs have been submitted successfully. The company will review them in the chat.
            </p>
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

export default FigmaSubmissionForm
