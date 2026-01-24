import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'
import './CompanyFigmaSubmissions.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const CompanyFigmaSubmissions = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userResult = await getUserProfile()
      if (userResult.user) {
        setUser(userResult.user)
      }

      const session = JSON.parse(localStorage.getItem('session') || '{}')
      
      // Fetch company projects
      const projectsResponse = await fetch(
        'http://127.0.0.1:8000/api/auth/company/projects/',
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      )

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        const allProjects = projectsData.projects || []
        
        // Fetch shortlist data for each project
        const projectsWithShortlists = []
        
        for (const project of allProjects) {
          try {
            const shortlistResponse = await fetch(
              `${API_BASE_URL}/projects/${project.id}/figma/get-shortlist/`,
              {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
              }
            )

            if (shortlistResponse.ok) {
              const shortlistData = await shortlistResponse.json()
              if (shortlistData.shortlisted && shortlistData.shortlist.length > 0) {
                projectsWithShortlists.push({
                  ...project,
                  shortlist: shortlistData.shortlist,
                  submitted_count: shortlistData.shortlist.filter(s => s.figma_submitted).length,
                  total_count: shortlistData.shortlist.length,
                  evaluated: shortlistData.shortlist.some(s => s.clip_score !== null),
                  all_submitted: shortlistData.shortlist.every(s => s.figma_submitted)
                })
              }
            }
          } catch (error) {
            console.error(`Failed to fetch shortlist for project ${project.id}:`, error)
          }
        }

        setProjects(projectsWithShortlists)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div className="loading">Please login to continue</div>

  return (
    <>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="page-header">
          <h1>🎨 Figma Design Submissions</h1>
          <Link to="/dashboard/company" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="figma-projects-grid">
            {projects.map(project => (
              <div key={project.id} className="figma-project-card">
                <div className="card-header">
                  <h2>{project.title}</h2>
                  <div className="status-badges">
                    <span className={`badge ${project.all_submitted ? 'success' : 'warning'}`}>
                      {project.submitted_count}/{project.total_count} Submitted
                    </span>
                    {project.evaluated && (
                      <span className="badge evaluated">✓ AI Evaluated</span>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  <p className="project-description">
                    {project.description.substring(0, 150)}...
                  </p>

                  <div className="shortlist-preview">
                    <h4>Shortlisted Developers:</h4>
                    <div className="developer-list">
                      {project.shortlist.map((dev, idx) => (
                        <div key={dev.shortlist_id} className="developer-preview">
                          <span className="rank">#{idx + 1}</span>
                          <span className="name">{dev.developer_name}</span>
                          {dev.figma_submitted ? (
                            <span className="status-icon submitted">✓</span>
                          ) : (
                            <span className="status-icon pending">⏳</span>
                          )}
                          {dev.clip_score !== null && (
                            <span className="score">{dev.clip_score.toFixed(1)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/dashboard/company/figma-review/${project.id}`)}
                    >
                      Review Designs
                    </button>
                    {!project.evaluated && project.all_submitted && (
                      <span className="hint">All submitted - Ready for AI evaluation!</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎨</div>
            <h2>No Figma Submissions Yet</h2>
            <p>When you shortlist top 3 applicants for a project, they'll be asked to submit Figma designs.</p>
            <p>Those submissions will appear here for review.</p>
            <Link to="/dashboard/company/my-projects" className="btn btn-primary">
              View My Projects
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

export default CompanyFigmaSubmissions
