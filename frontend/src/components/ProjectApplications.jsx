import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getUserProfile, getProjectApplications, getCompanyTeams, addToTeam } from '../services/api'
import Navbar from './Navbar'
import './ProjectApplications.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const ProjectApplications = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

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

        const teamsResult = await getCompanyTeams()
        if (teamsResult.success) {
          setTeams(teamsResult.teams)
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

  const handleAddToTeam = async (applicationId, developerId, teamId, role = 'Developer') => {
    try {
      const result = await addToTeam({
        team_id: teamId,
        developer_id: developerId,
        role: role
      })
      
      if (result.success) {
        alert('Developer added to team successfully!')
        const teamsResult = await getCompanyTeams()
        if (teamsResult.success) {
          setTeams(teamsResult.teams)
        }
      } else {
        alert('Failed to add to team: ' + result.error)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleAssignProject = async (applicationId) => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/assign_project/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            application_id: applicationId
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        alert('Project assigned successfully!')
        // Refresh applications list
        const applicationsResult = await getProjectApplications(projectId)
        if (applicationsResult.applications) {
          setApplications(applicationsResult.applications)
        }
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to assign project'}`)
      }
    } catch (error) {
      console.error('Error assigning project:', error)
      alert('Failed to assign project')
    }
  }

  const handleViewProfile = (developerId) => {
    navigate(`/developer/${developerId}`)
  }

  if (loading) return <div className="loading">Loading applications...</div>
  if (!user) return <div className="loading">Please login to continue</div>

  return (
    <>
      <Navbar user={user} />
      <div className="applications-container">
        <div className="applications-header">
          <h1>Project Applications</h1>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <Link to="/dashboard/company/teams" className="btn btn-secondary">
              👥 Manage Teams
            </Link>
            <Link to="/dashboard/company/my-projects" className="back-button">
              ← Back to My Projects
            </Link>
          </div>
        </div>

        {teams.length > 0 && (
          <div style={{marginBottom: '30px'}}>
            <h2>Created Teams ({teams.length})</h2>
            <div className="projects-grid">
              {teams.map(team => (
                <div key={team.id} className="project-card">
                  <h3>👥 {team.team_name}</h3>
                  <p>💰 Cost: ${team.total_cost}</p>
                  <p>📊 Score: {team.combined_score.toFixed(1)}%</p>
                  <p>👨💻 Members: {team.members_data?.length || 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="applications-list">
          {applications.length > 0 ? (
            applications.map(application => (
              <div key={application.id} className="application-card">
                <div className="application-header">
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
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddToTeam(application.id, application.developer_id, e.target.value)
                          e.target.value = ''
                        }
                      }}
                      style={{padding: '8px', borderRadius: '4px'}}
                    >
                      <option value="">Add to Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.team_name} ({team.members_data?.length || 0} members)
                        </option>
                      ))}
                    </select>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAssignProject(application.id)}
                      disabled={application.status !== 'pending'}
                    >
                      {application.status === 'pending' ? 'Assign Project' : 'Already Assigned'}
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleViewProfile(application.developer_email)}
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No applications yet for this project.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProjectApplications
