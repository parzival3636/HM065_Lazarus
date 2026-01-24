import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const ProjectSubmissionForm = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [description, setDescription] = useState('')
  const [documentationLinks, setDocumentationLinks] = useState([''])
  const [githubLinks, setGithubLinks] = useState([''])
  const [projectLinks, setProjectLinks] = useState([''])
  const [additionalLinks, setAdditionalLinks] = useState([''])
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
        setDaysRemaining(data.submission_days_remaining)
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = (type) => {
    switch (type) {
      case 'documentation':
        setDocumentationLinks([...documentationLinks, ''])
        break
      case 'github':
        setGithubLinks([...githubLinks, ''])
        break
      case 'project':
        setProjectLinks([...projectLinks, ''])
        break
      case 'additional':
        setAdditionalLinks([...additionalLinks, ''])
        break
    }
  }

  const handleRemoveLink = (type, index) => {
    switch (type) {
      case 'documentation':
        setDocumentationLinks(documentationLinks.filter((_, i) => i !== index))
        break
      case 'github':
        setGithubLinks(githubLinks.filter((_, i) => i !== index))
        break
      case 'project':
        setProjectLinks(projectLinks.filter((_, i) => i !== index))
        break
      case 'additional':
        setAdditionalLinks(additionalLinks.filter((_, i) => i !== index))
        break
    }
  }

  const handleLinkChange = (type, index, value) => {
    switch (type) {
      case 'documentation':
        const newDocs = [...documentationLinks]
        newDocs[index] = value
        setDocumentationLinks(newDocs)
        break
      case 'github':
        const newGithub = [...githubLinks]
        newGithub[index] = value
        setGithubLinks(newGithub)
        break
      case 'project':
        const newProjects = [...projectLinks]
        newProjects[index] = value
        setProjectLinks(newProjects)
        break
      case 'additional':
        const newAdditional = [...additionalLinks]
        newAdditional[index] = value
        setAdditionalLinks(newAdditional)
        break
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/${assignmentId}/submit_project/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: description,
            documentation_links: documentationLinks.filter(l => l.trim()),
            github_links: githubLinks.filter(l => l.trim()),
            project_links: projectLinks.filter(l => l.trim()),
            additional_links: additionalLinks.filter(l => l.trim())
          })
        }
      )

      if (response.ok) {
        alert('Project submitted successfully!')
        navigate(`/assignment/${assignmentId}/chat`)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to submit'}`)
      }
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Failed to submit project')
    } finally {
      setSubmitting(false)
    }
  }

  const LinkInput = ({ type, links, onAdd, onChange, onRemove }) => (
    <div style={{ marginBottom: '2rem' }}>
      <label style={{
        display: 'block',
        color: '#fff',
        fontWeight: '600',
        marginBottom: '1rem',
        fontSize: '0.95rem'
      }}>
        {type === 'documentation' && '📄 Documentation Links (PDFs)'}
        {type === 'github' && '💻 GitHub Repository Links'}
        {type === 'project' && '🚀 Live Project Links'}
        {type === 'additional' && '🔗 Additional Links'}
      </label>

      {links.map((link, index) => (
        <div key={index} style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <input
            type="url"
            value={link}
            onChange={(e) => onChange(type, index, e.target.value)}
            placeholder={`Enter ${type} link...`}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
          {links.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(type, index)}
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onAdd(type)}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '8px',
          color: '#a78bfa',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        + Add Link
      </button>
    </div>
  )

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
    if (daysRemaining <= 7) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
            Submit Final Project
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
                {new Date(assignment?.submission_deadline).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                STATUS
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: assignment?.project_submitted ? '#10b981' : '#f59e0b'
              }}>
                {assignment?.project_submitted ? '✓ Submitted' : 'Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {!assignment?.project_submitted ? (
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '0.95rem'
              }}>
                Project Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, features implemented, technologies used, challenges overcome, and any additional notes..."
                rows="8"
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
              <p style={{ color: '#71717a', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                Provide a comprehensive description of your project
              </p>
            </div>

            {/* Links Sections */}
            <LinkInput
              type="documentation"
              links={documentationLinks}
              onAdd={handleAddLink}
              onChange={handleLinkChange}
              onRemove={handleRemoveLink}
            />

            <LinkInput
              type="github"
              links={githubLinks}
              onAdd={handleAddLink}
              onChange={handleLinkChange}
              onRemove={handleRemoveLink}
            />

            <LinkInput
              type="project"
              links={projectLinks}
              onAdd={handleAddLink}
              onChange={handleLinkChange}
              onRemove={handleRemoveLink}
            />

            <LinkInput
              type="additional"
              links={additionalLinks}
              onAdd={handleAddLink}
              onChange={handleLinkChange}
              onRemove={handleRemoveLink}
            />

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '2rem'
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
                disabled={submitting || !description.trim()}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: submitting || !description.trim() ? 'not-allowed' : 'pointer',
                  opacity: submitting || !description.trim() ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Project'}
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
            <h2 style={{ color: '#10b981', margin: '0 0 1rem 0' }}>Project Submitted</h2>
            <p style={{ color: '#a1a1aa', margin: 0 }}>
              Your project has been submitted successfully. The company will review it and provide feedback.
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

export default ProjectSubmissionForm
