import { useState, useEffect } from 'react'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const ActiveProjects = () => {
  const [user, setUser] = useState(null)
  const [activeProjects, setActiveProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
          await fetchActiveProjects()
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchActiveProjects = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch('http://127.0.0.1:8000/api/projects/assignments/company_assignments/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setActiveProjects(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch active projects:', error)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="projects-header">
          <h1>Active Projects</h1>
          <p>Projects that have been assigned to developers</p>
        </div>

        <div className="projects-grid">
          {activeProjects.length > 0 ? (
            activeProjects.map(assignment => (
              <div key={assignment.id} className="project-card">
                <h3>{assignment.project_title}</h3>
                <p className="description">Assigned to: {assignment.developer_name}</p>
                <div className="project-meta">
                  <span className="budget">Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}</span>
                  <span className="status">
                    {assignment.project_submitted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="project-progress">
                  <p>Figma: {assignment.figma_submitted ? '✅ Submitted' : '⏳ Pending'}</p>
                  <p>Project: {assignment.project_submitted ? '✅ Submitted' : '⏳ Pending'}</p>
                </div>
                <div className="project-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.open(`/assignment/${assignment.id}/chat`, '_blank')}
                  >
                    Open Chat
                  </button>
                  {assignment.project_submitted && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => window.open(`/assignment/${assignment.id}/review`, '_blank')}
                    >
                      Review Submission
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No active projects yet.</p>
              <p>Assign projects to developers to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActiveProjects