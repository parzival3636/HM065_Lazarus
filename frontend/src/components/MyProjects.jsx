import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserProfile, getCompanyProjects } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const MyProjects = () => {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }
        
        const projectsResult = await getCompanyProjects()
        if (projectsResult.projects) {
          setProjects(projectsResult.projects)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatBudget = (min, max) => {
    if (min === max) return `$${min}`
    return `$${min} - $${max}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleViewApplications = (projectId) => {
    navigate(`/dashboard/company/projects/${projectId}/applications`)
  }

  const handleEditProject = (projectId) => {
    navigate(`/dashboard/company/projects/${projectId}/edit`)
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="profile-header">
          <h1>My Projects</h1>
          <p>Projects that haven't been assigned yet</p>
          <Link to="/dashboard/company/post-project" className="btn btn-primary">
            Post New Project
          </Link>
        </div>

        <div className="projects-grid">
          {projects.filter(project => !project.assigned).length > 0 ? (
            projects.filter(project => !project.assigned).map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p className="description">{project.description}</p>
                <div className="project-meta">
                  <span className="budget">{formatBudget(project.budget_min, project.budget_max)}</span>
                  <span className={`status ${project.status}`}>
                    {project.status}
                  </span>
                </div>
                <div className="skills">
                  {project.tech_stack && project.tech_stack.map(tech => (
                    <span key={tech} className="skill-tag">{tech}</span>
                  ))}
                </div>
                <p>Applications: {project.applications_count}</p>
                <p>Posted: {formatDate(project.created_at)}</p>
                <div className="project-actions">
                  {project.applications_count > 0 && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleViewApplications(project.id)}
                    >
                      View Applications ({project.applications_count})
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditProject(project.id)}
                  >
                    Edit Project
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No projects yet. Post your first project to get started!</p>
              <Link to="/dashboard/company/post-project" className="btn btn-primary">
                Post Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyProjects