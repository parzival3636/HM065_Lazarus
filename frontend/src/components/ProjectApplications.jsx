import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getUserProfile, getProjectApplications } from '../services/api'
import Navbar from './Navbar'
import './ProjectApplications.css'

const ProjectApplications = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedApp, setExpandedApp] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }
        
        const applicationsResult = await getProjectApplications(projectId)
        console.log('Applications received:', applicationsResult)
        if (applicationsResult.applications) {
          setApplications(applicationsResult.applications)
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const getScoreGradient = (score) => {
    if (!score) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    if (score >= 80) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    if (score >= 60) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }

  const getScoreBadge = (score) => {
    if (!score) return 'Analyzing...'
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  }

  const handleAssignProject = (applicationId) => {
    console.log('Assigning project to application:', applicationId)
    alert('🎉 Project assignment feature coming soon!')
  }

  const handleViewProfile = (developerId) => {
    navigate(`/developer/${developerId}`)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    )
  }
  
  if (!user) return <div className="error-container">Please login to continue</div>

  return (
    <div className="applications-page">
      <Navbar user={user} />
      
      <div className="applications-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">📋</span>
              Project Applications
            </h1>
            <p className="page-subtitle">Review and manage candidate applications</p>
          </div>
          <Link to="/dashboard/company/my-projects" className="back-button">
            <span>←</span> Back to Projects
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="applications-grid">
            {applications.map((application, index) => (
              <div 
                key={application.id} 
                className="application-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header with Score */}
                <div className="card-header">
                  <div className="developer-info">
                    <div className="avatar" style={{ background: getScoreGradient(application.match_score) }}>
                      {(application.developer_name || application.developer_email).charAt(0).toUpperCase()}
                    </div>
                    <div className="developer-details">
                      <h3 className="developer-name">
                        {application.developer_name || application.developer_email}
                      </h3>
                      <p className="developer-title">{application.developer_title}</p>
                      <p className="developer-email">{application.developer_email}</p>
                    </div>
                  </div>
                  
                  <div className="score-badge" style={{ background: getScoreGradient(application.match_score) }}>
                    <div className="score-number">{application.match_score || '—'}%</div>
                    <div className="score-label">{getScoreBadge(application.match_score)}</div>
                  </div>
                </div>

                {/* AI Analysis Section */}
                {application.match_score && (
                  <div className="ai-analysis">
                    <div className="analysis-header">
                      <span className="ai-icon">🤖</span>
                      <h4>AI Match Analysis</h4>
                    </div>
                    
                    <div className="score-breakdown">
                      <div className="score-item">
                        <div className="score-item-header">
                          <span className="score-item-label">Skills Match</span>
                          <span className="score-item-value">{application.skill_match_score || 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${application.skill_match_score || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="score-item">
                        <div className="score-item-header">
                          <span className="score-item-label">Experience Fit</span>
                          <span className="score-item-value">{application.experience_fit_score || 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${application.experience_fit_score || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="score-item">
                        <div className="score-item-header">
                          <span className="score-item-label">Portfolio Quality</span>
                          <span className="score-item-value">{application.portfolio_quality_score || 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${application.portfolio_quality_score || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="skills-section">
                      {application.matching_skills && application.matching_skills.length > 0 && (
                        <div className="skills-group">
                          <div className="skills-label">
                            <span className="check-icon">✓</span> Matching Skills
                          </div>
                          <div className="skills-tags">
                            {application.matching_skills.map((skill, idx) => (
                              <span key={idx} className="skill-tag skill-match">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {application.missing_skills && application.missing_skills.length > 0 && (
                        <div className="skills-group">
                          <div className="skills-label">
                            <span className="cross-icon">✗</span> Missing Skills
                          </div>
                          <div className="skills-tags">
                            {application.missing_skills.map((skill, idx) => (
                              <span key={idx} className="skill-tag skill-missing">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {application.ai_reasoning && (
                      <div className="ai-reasoning">
                        <span className="reasoning-icon">💡</span>
                        <p>{application.ai_reasoning}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Developer Stats */}
                {application.developer_stats && (
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">⭐</div>
                      <div className="stat-content">
                        <div className="stat-value">{application.developer_stats.rating.toFixed(1)}</div>
                        <div className="stat-label">Rating</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">💼</div>
                      <div className="stat-content">
                        <div className="stat-value">{application.developer_stats.years_experience}</div>
                        <div className="stat-label">Years Exp</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📊</div>
                      <div className="stat-content">
                        <div className="stat-value">{application.developer_stats.total_projects}</div>
                        <div className="stat-label">Projects</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🎯</div>
                      <div className="stat-content">
                        <div className="stat-value">{application.developer_stats.success_rate.toFixed(0)}%</div>
                        <div className="stat-label">Success</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Details */}
                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">💰 Proposed Budget</span>
                    <span className="detail-value">${application.proposed_rate || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">⏱️ Timeline</span>
                    <span className="detail-value">{application.estimated_duration}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📅 Applied</span>
                    <span className="detail-value">{new Date(application.applied_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge status-${application.status}`}>
                      {application.status}
                    </span>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="cover-letter-section">
                  <button 
                    className="cover-letter-toggle"
                    onClick={() => setExpandedApp(expandedApp === application.id ? null : application.id)}
                  >
                    <span>📝 Cover Letter</span>
                    <span className={`toggle-icon ${expandedApp === application.id ? 'expanded' : ''}`}>▼</span>
                  </button>
                  {expandedApp === application.id && (
                    <div className="cover-letter-content">
                      {application.cover_letter}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <button 
                    className="action-button primary"
                    onClick={() => handleAssignProject(application.id)}
                    disabled={application.status !== 'pending'}
                  >
                    <span>✓</span> Assign Project
                  </button>
                  <button 
                    className="action-button secondary"
                    onClick={() => handleViewProfile(application.developer_email)}
                  >
                    <span>👤</span> View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Applications Yet</h3>
            <p>When developers apply to your project, they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectApplications