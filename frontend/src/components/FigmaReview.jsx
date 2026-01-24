import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './FigmaReview.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const FigmaReview = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [project, setProject] = useState(null)
  const [shortlist, setShortlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    try {
      const userResult = await getUserProfile()
      if (userResult.user) {
        setUser(userResult.user)
      }

      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/figma/get-shortlist/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setProject({
          id: data.project_id,
          title: data.project_title
        })
        setShortlist(data.shortlist || [])
      }
    } catch (error) {
      console.error('Failed to fetch shortlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async () => {
    const submittedCount = shortlist.filter(s => s.figma_submitted).length
    
    if (submittedCount === 0) {
      alert('No Figma submissions yet. Please wait for developers to submit.')
      return
    }

    const isReEvaluation = shortlist.some(s => s.clip_score !== null)
    
    const confirmMessage = isReEvaluation
      ? `Re-evaluate ${submittedCount} Figma submission(s) with Enhanced AI?\n\n✨ NEW: Multi-criteria scoring system\n- Design Quality Assessment\n- Requirement Matching\n- UI Element Detection\n- More accurate rankings\n\nThis will update the existing scores.`
      : `Evaluate ${submittedCount} Figma submission(s) using Enhanced AI?\n\n✨ Multi-criteria evaluation:\n- Design Quality (25%)\n- Requirement Match (35%)\n- Overall Similarity (30%)\n- UI Elements (10%)\n\nThis provides objective rankings based on design quality and requirements.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setEvaluating(true)
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/figma/evaluate/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        }
      )

      if (response.ok) {
        const message = isReEvaluation
          ? 'Designs re-evaluated successfully with enhanced scoring!\n\nScores have been updated with the new multi-criteria system.'
          : 'Figma submissions evaluated successfully!\n\nDesigns have been scored and ranked using enhanced AI evaluation.'
        
        alert(message)
        fetchData() // Refresh to show scores
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to evaluate submissions'}`)
      }
    } catch (error) {
      console.error('Error evaluating:', error)
      alert('Failed to evaluate submissions')
    } finally {
      setEvaluating(false)
    }
  }

  const handleAssign = async (developerId) => {
    if (!confirm('Assign this project to the selected developer?')) {
      return
    }

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/figma/assign/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ developer_id: developerId })
        }
      )

      if (response.ok) {
        const data = await response.json()
        alert(`Project assigned successfully! ${data.chat_created ? 'Chat room created.' : ''}\n\nYou can now communicate with the developer and track submissions in Team Assignments.`)
        navigate('/dashboard/company/team-assignments')
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to assign project'}`)
      }
    } catch (error) {
      console.error('Error assigning:', error)
      alert('Failed to assign project')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div className="loading">Please login to continue</div>

  const allSubmitted = shortlist.length > 0 && shortlist.every(s => s.figma_submitted)
  const anyEvaluated = shortlist.some(s => s.clip_score !== null)
  const submittedCount = shortlist.filter(s => s.figma_submitted).length

  return (
    <>
      <Navbar user={user} />
      <div className="figma-review-container">
        <div className="figma-header">
          <h1>Figma Design Review</h1>
          <Link to={`/dashboard/company/applications/${projectId}`} className="back-button">
            ← Back to Applications
          </Link>
        </div>

        {project && (
          <div className="project-info">
            <h2>{project.title}</h2>
            <p>Top 3 applicants have been shortlisted to submit Figma designs</p>
          </div>
        )}

        <div className="review-actions">
          <div className="status-info">
            <strong>Submissions: {submittedCount}/{shortlist.length}</strong>
            {anyEvaluated && <span className="evaluated-badge">✓ AI Evaluated</span>}
          </div>
          <div className="action-buttons">
            {submittedCount > 0 && (
              <button 
                className={`btn ${anyEvaluated ? 'btn-secondary' : 'btn-ai'}`}
                onClick={handleEvaluate}
                disabled={evaluating}
              >
                {evaluating ? '⏳ Evaluating...' : anyEvaluated ? '🔄 Re-evaluate with AI' : '🤖 Evaluate with AI'}
              </button>
            )}
          </div>
        </div>

        {anyEvaluated && (
          <div className="info-banner info-banner-success">
            <strong>✓ AI Evaluation Complete</strong>
            <p>Designs have been scored and ranked. You can re-evaluate anytime to update scores with the enhanced model.</p>
          </div>
        )}

        {submittedCount > 0 && !anyEvaluated && (
          <div className="info-banner">
            <strong>💡 Two Options:</strong>
            <ul>
              <li><strong>Manual Review:</strong> Review Figma designs yourself and assign directly</li>
              <li><strong>AI Evaluation:</strong> Use OpenCLIP AI to analyze and rank designs objectively</li>
            </ul>
          </div>
        )}

        <div className="shortlist-grid">
          {shortlist.map((item, index) => (
            <div key={item.shortlist_id} className="figma-card">
              <div className="card-header">
                <div className="rank-badge">#{index + 1}</div>
                <h3>{item.developer_name}</h3>
              </div>

              <div className="developer-details">
                <p><strong>Email:</strong> {item.developer_email}</p>
                <p><strong>Match Score:</strong> {item.match_score}%</p>
                <p><strong>Deadline:</strong> {new Date(item.figma_deadline).toLocaleDateString()}</p>
              </div>

              {item.figma_submitted ? (
                <div className="submission-section">
                  <div className="submission-badge success">✓ Submitted</div>
                  <p><strong>Submitted:</strong> {new Date(item.submitted_at).toLocaleString()}</p>
                  
                  {item.figma_url && (
                    <a 
                      href={item.figma_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="figma-link"
                    >
                      View Figma Design →
                    </a>
                  )}

                  {item.design_images && item.design_images.length > 0 && (
                    <div className="design-images-section">
                      <h4>Design Images</h4>
                      <div className="design-images-grid">
                        {item.design_images.map((imageUrl, idx) => (
                          <a 
                            key={idx}
                            href={imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="design-image-link"
                          >
                            <img src={imageUrl} alt={`Design ${idx + 1}`} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!anyEvaluated && (
                    <div className="manual-assign-section">
                      <p className="manual-hint">You can assign directly without AI evaluation</p>
                      <button 
                        className="btn btn-assign-manual"
                        onClick={() => handleAssign(item.developer_id)}
                      >
                        Assign Project (Manual)
                      </button>
                    </div>
                  )}

                  {item.clip_score !== null && (
                    <div className="ai-evaluation">
                      <h4>AI Evaluation</h4>
                      <div className="score-display">
                        <div className="score-value">{item.clip_score.toFixed(1)}</div>
                        <div className="score-label">CLIP Score</div>
                      </div>
                      <div className="rank-display">
                        Rank: #{item.clip_rank}
                      </div>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleAssign(item.developer_id)}
                      >
                        Assign Project
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="submission-section">
                  <div className="submission-badge pending">⏳ Pending</div>
                  <p>Waiting for Figma submission...</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {shortlist.length === 0 && (
          <div className="empty-state">
            <p>No shortlist found. Please go back and shortlist top 3 applicants.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default FigmaReview
