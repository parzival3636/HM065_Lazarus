import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getUserProfile, getProjectApplications } from '../services/api'
import Navbar from './Navbar'
import './EnhancedApplications.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const EnhancedProjectApplications = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [teamName, setTeamName] = useState('')
  const [showTeamModal, setShowTeamModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }
        
        const applicationsResult = await getProjectApplications(projectId)
        if (applicationsResult.applications) {
          // Sort by match score descending
          const sorted = applicationsResult.applications.sort((a, b) => 
            (b.match_score || 0) - (a.match_score || 0)
          )
          setApplications(sorted)
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const getScoreBadge = (score) => {
    if (!score) return 'Not Scored'
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  }

  const toggleDeveloperSelection = (developerId) => {
    setSelectedDevelopers(prev => {
      const newSelection = prev.includes(developerId)
        ? prev.filter(id => id !== developerId)
        : [...prev, developerId]
      
      return newSelection
    })
  }

  const handleCreateTeam = () => {
    if (selectedDevelopers.length === 0) {
      alert('Please select at least one developer')
      return
    }
    setShowTeamModal(true)
  }

  const handleAssignSingle = () => {
    // Shortlist top 3 for Figma verification (selection is ignored)
    handleShortlistForFigma()
  }

  const handleShortlistForFigma = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/figma/shortlist/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        alert(`Top 3 applicants shortlisted for Figma submission!\nDeadline: ${new Date(data.figma_deadline).toLocaleDateString()}`)
        navigate(`/dashboard/company/figma-review/${projectId}`)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to shortlist applicants'}`)
      }
    } catch (error) {
      console.error('Error shortlisting for Figma:', error)
      alert('Failed to shortlist applicants')
    }
  }

  const confirmTeamCreation = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name')
      return
    }

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/create_team_assignment/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project_id: projectId,
            team_name: teamName,
            developer_ids: selectedDevelopers
          })
        }
      )

      if (response.ok) {
        alert('Team created and project assigned successfully!')
        navigate('/dashboard/company/assignments')
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to create team'}`)
      }
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Failed to create team')
    }
  }

  const handleViewProfile = (developerId) => {
    navigate(`/developer/${developerId}`)
  }

  if (loading) return <div className="loading">Loading applications...</div>
  if (!user) return <div className="loading">Please login to continue</div>

  const topThree = applications.slice(0, 3)
  const remaining = applications.slice(3)

  return (
    <>
      <Navbar user={user} />
      <div className="applications-container">
        <div className="applications-header">
          <h1>Project Applications</h1>
          <Link to="/dashboard/company/my-projects" className="back-button">
            ← Back to My Projects
          </Link>
        </div>

        {/* Shortlist Top 3 Action - Always visible */}
        <div className="shortlist-action-bar">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleAssignSingle}
            disabled={applications.length < 3}
          >
            🏆 Shortlist Top 3 for Figma Review
          </button>
          {applications.length < 3 && (
            <p className="info-text">Need at least 3 applications to shortlist</p>
          )}
        </div>

        {/* Selection Actions */}
        {selectedDevelopers.length > 0 && (
          <div className="selection-bar">
            <div className="selection-bar-info">
              <strong>{selectedDevelopers.length} developer(s) selected</strong>
            </div>
            <div className="selection-bar-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedDevelopers([])}
              >
                Clear Selection
              </button>
              {selectedDevelopers.length >= 1 && (
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateTeam}
                >
                  Create Team ({selectedDevelopers.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top 3 Applicants */}
        {topThree.length > 0 && (
          <div style={{marginBottom: '40px'}}>
            <h2 className="section-header top-three">
              🏆 Top 3 Matches
            </h2>
            <div className="applications-list">
              {topThree.map((application, index) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  index={index}
                  isSelected={selectedDevelopers.includes(application.developer_id)}
                  onToggleSelect={() => toggleDeveloperSelection(application.developer_id)}
                  onViewProfile={handleViewProfile}
                  getScoreBadge={getScoreBadge}
                  isTopThree={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Other Applicants */}
        {remaining.length > 0 && (
          <div>
            <h2 className="section-header all-applicants">
              All Applicants ({remaining.length})
            </h2>
            <div className="applications-list">
              {remaining.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  isSelected={selectedDevelopers.includes(application.developer_id)}
                  onToggleSelect={() => toggleDeveloperSelection(application.developer_id)}
                  onViewProfile={handleViewProfile}
                  getScoreBadge={getScoreBadge}
                  isTopThree={false}
                />
              ))}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="empty-state">
            <p>No applications yet for this project.</p>
          </div>
        )}

        {/* Team Creation Modal */}
        {showTeamModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Create Team</h2>
              <p>Creating a team with {selectedDevelopers.length} developer(s)</p>
              <div style={{marginBottom: '20px'}}>
                <label>Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTeamModal(false)
                    setTeamName('')
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmTeamCreation}
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const ApplicationCard = ({ 
  application, 
  index, 
  isSelected, 
  onToggleSelect, 
  onViewProfile, 
  getScoreBadge,
  isTopThree 
}) => {
  const handleCheckboxChange = (e) => {
    e.stopPropagation()
    onToggleSelect()
  }

  return (
    <div 
      className={`application-card ${isSelected ? 'selected' : ''} ${isTopThree ? 'top-three' : ''}`}
    >
      {/* Top 3 Badge */}
      {isTopThree && (
        <div className={`rank-badge rank-${index + 1}`}>
          #{index + 1}
        </div>
      )}

      {/* Selection Checkbox */}
      <div className="selection-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="application-header" style={{marginTop: isTopThree ? '10px' : '0'}}>
        <div className="developer-info">
          <h3>{application.developer_name || application.developer_email}</h3>
          <p className="title">{application.developer_title}</p>
          <p className="email">{application.developer_email}</p>
        </div>
        <div className="ml-score-badge">
          <div className="score">{application.match_score || 'N/A'}%</div>
          <div className="label">{getScoreBadge(application.match_score)}</div>
        </div>
      </div>

      {/* ML Scoring Breakdown */}
      {application.match_score && (
        <div className="ml-breakdown">
          <h4>AI Match Analysis</h4>
          <div className="score-grid">
            <div className="score-item">
              <strong>Skill Match</strong>
              <div className="value">{application.skill_match_score || 0}%</div>
            </div>
            <div className="score-item">
              <strong>Experience Fit</strong>
              <div className="value">{application.experience_fit_score || 0}%</div>
            </div>
            <div className="score-item">
              <strong>Portfolio Quality</strong>
              <div className="value">{application.portfolio_quality_score || 0}%</div>
            </div>
          </div>

          {/* Matching Skills */}
          {application.matching_skills && application.matching_skills.length > 0 && (
            <div className="skills-section matching">
              <strong>✓ Matching Skills</strong>
              <div className="skills-tags">
                {application.matching_skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag matching">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {application.missing_skills && application.missing_skills.length > 0 && (
            <div className="skills-section missing">
              <strong>✗ Missing Skills</strong>
              <div className="skills-tags">
                {application.missing_skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag missing">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {application.ai_reasoning && (
            <div className="ai-reasoning">
              <strong>AI Analysis</strong>
              <p>{application.ai_reasoning}</p>
            </div>
          )}
        </div>
      )}

      {/* Developer Stats */}
      {application.developer_stats && (
        <div className="developer-stats">
          <div className="stat-card">
            <strong>Rating</strong>
            <p>⭐ {application.developer_stats.rating.toFixed(1)}/5.0</p>
          </div>
          <div className="stat-card">
            <strong>Experience</strong>
            <p>{application.developer_stats.years_experience} years</p>
          </div>
          <div className="stat-card">
            <strong>Projects</strong>
            <p>{application.developer_stats.total_projects}</p>
          </div>
          <div className="stat-card">
            <strong>Success Rate</strong>
            <p>{application.developer_stats.success_rate.toFixed(0)}%</p>
          </div>
        </div>
      )}
      
      <div className="application-details">
        <p><strong>Proposed Budget:</strong> ${application.proposed_rate || 'Not specified'}</p>
        <p><strong>Timeline:</strong> {application.estimated_duration}</p>
        <p>
          <strong>Status:</strong>
          <span className={`status-badge ${application.status}`}>
            {application.status}
          </span>
        </p>
        <p><strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()}</p>
      </div>

      <div className="cover-letter">
        <h4>Cover Letter</h4>
        <div className="cover-letter-content">
          {application.cover_letter}
        </div>
      </div>

      <div className="application-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => onViewProfile(application.developer_email)}
        >
          View Full Profile
        </button>
      </div>
    </div>
  )
}

export default EnhancedProjectApplications
