import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const DeveloperDashboard = () => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    activeApplications: 0,
    completedProjects: 0,
    totalEarnings: 0,
    successRate: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [assignedProjects, setAssignedProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
          await fetchDashboardData(userResult.user.id)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchDashboardData = async (userId) => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      
      // Fetch applications
      const appsResponse = await fetch('http://127.0.0.1:8000/api/projects/applications/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        const applications = appsData.applications || []
        setRecentApplications(applications.slice(0, 3))
        
        setStats(prev => ({
          ...prev,
          activeApplications: applications.filter(app => app.status === 'pending').length
        }))
      }
      
      // Fetch assigned projects
      const assignedResponse = await fetch('http://127.0.0.1:8000/api/projects/assignments/developer_assignments/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json()
        setAssignedProjects(assignedData.slice(0, 3))
        
        setStats(prev => ({
          ...prev,
          completedProjects: assignedData.filter(p => p.project_submitted).length
        }))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Active Applications</h3>
            <span className="stat-number">{stats.activeApplications}</span>
          </div>
          <div className="stat-card">
            <h3>Projects Completed</h3>
            <span className="stat-number">{stats.completedProjects}</span>
          </div>
          <div className="stat-card">
            <h3>Total Earnings</h3>
            <span className="stat-number">${stats.totalEarnings}</span>
          </div>
          <div className="stat-card">
            <h3>Success Rate</h3>
            <span className="stat-number">{stats.successRate}%</span>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="main-content">
            <section className="recent-projects">
              <h2>Assigned Projects</h2>
              <div className="project-list">
                {assignedProjects.length > 0 ? (
                  assignedProjects.map(project => (
                    <div key={project.id} className="project-item">
                      <h4>{project.project_title}</h4>
                      <p>Company: {project.company_name}</p>
                      <span className={`status ${project.project_submitted ? 'completed' : 'active'}`}>
                        {project.project_submitted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No assigned projects yet.</p>
                  </div>
                )}
              </div>
              <Link to="/dashboard/developer/assigned-projects" className="view-all">View All Assigned Projects</Link>
            </section>

            <section className="recent-projects">
              <h2>Recent Project Applications</h2>
              <div className="project-list">
                {recentApplications.length > 0 ? (
                  recentApplications.map(app => (
                    <div key={app.id} className="project-item">
                      <h4>{app.project_title}</h4>
                      <p>Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                      <span className={`status ${app.status}`}>{app.status}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No applications yet. Start browsing projects to apply!</p>
                  </div>
                )}
              </div>
              <Link to="/projects" className="view-all">Browse Projects</Link>
            </section>

            <section className="recommended-projects">
              <h2>Recommended Projects</h2>
              <div className="project-list">
                <div className="empty-state">
                  <p>Complete your profile to see personalized project recommendations.</p>
                </div>
              </div>
              <Link to="/projects" className="view-all">Browse All Projects</Link>
            </section>
          </div>

          <aside className="sidebar">
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <Link to="/projects" className="btn btn-primary">Browse Projects</Link>
              <Link to="/profile/edit" className="btn btn-secondary">Edit Profile</Link>
              <Link to="/dashboard/developer/portfolio" className="btn btn-secondary">Manage Portfolio</Link>
              <Link to="/earnings" className="btn btn-secondary">View Earnings</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default DeveloperDashboard