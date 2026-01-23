import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const CompanyDashboard = () => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalApplications: 0,
    completedProjects: 0,
    totalSpent: 0
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
          await fetchDashboardData()
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      
      // Fetch company projects
      const projectsResponse = await fetch('http://127.0.0.1:8000/api/auth/company/projects/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        const projects = projectsData.projects || []
        setRecentProjects(projects.slice(0, 3))
        
        setStats(prev => ({
          ...prev,
          activeProjects: projects.filter(p => p.status === 'open' || p.status === 'active' || p.status === 'published').length,
          completedProjects: projects.filter(p => p.status === 'completed').length
        }))
        
        // Fetch recent applications for all projects
        let totalApps = 0
        const allApplications = []
        
        for (const project of projects) {
          try {
            const appsResponse = await fetch(`http://127.0.0.1:8000/api/auth/company/projects/${project.id}/applications/`, {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
            
            if (appsResponse.ok) {
              const appsData = await appsResponse.json()
              const apps = appsData.applications || []
              totalApps += apps.length
              allApplications.push(...apps)
            }
          } catch (error) {
            console.error(`Failed to fetch applications for project ${project.id}:`, error)
          }
        }
        
        setStats(prev => ({
          ...prev,
          totalApplications: totalApps
        }))
        
        setRecentApplications(allApplications.slice(0, 3))
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
            <h3>Active Projects</h3>
            <span className="stat-number">{stats.activeProjects}</span>
          </div>
          <div className="stat-card">
            <h3>Total Applications</h3>
            <span className="stat-number">{stats.totalApplications}</span>
          </div>
          <div className="stat-card">
            <h3>Completed Projects</h3>
            <span className="stat-number">{stats.completedProjects}</span>
          </div>
          <div className="stat-card">
            <h3>Total Spent</h3>
            <span className="stat-number">${stats.totalSpent}</span>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="main-content">
            <section className="recent-projects">
              <h2>Active Projects</h2>
              <div className="project-list">
                {recentProjects.length > 0 ? (
                  recentProjects.filter(p => p.status === 'open' || p.status === 'active' || p.status === 'published').map(project => (
                    <div key={project.id} className="project-item">
                      <h4>{project.title}</h4>
                      <p>Budget: ${project.budget_min} - ${project.budget_max}</p>
                      <span className={`status ${project.status}`}>{project.status}</span>
                      <span className="applications-count">{project.applications_count || 0} applications</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No active projects. Post your first project to get started!</p>
                  </div>
                )}
              </div>
              <Link to="/dashboard/company/my-projects" className="view-all">View All Projects</Link>
            </section>

            <section className="recent-applications">
              <h2>Recent Applications</h2>
              <div className="application-list">
                {recentApplications.length > 0 ? (
                  recentApplications.map(app => (
                    <div key={app.id} className="application-item">
                      <h4>{app.developer_name}</h4>
                      <p>Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                      <span className={`status ${app.status}`}>{app.status}</span>
                      {app.match_score && <span className="match-score">Match: {app.match_score}%</span>}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No applications yet. Post projects to start receiving applications from developers.</p>
                  </div>
                )}
              </div>
              <Link to="/dashboard/company/my-projects" className="view-all">View All Applications</Link>
            </section>
          </div>

          <aside className="sidebar">
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <Link to="/dashboard/company/post-project" className="btn btn-primary">Post New Project</Link>
              <Link to="/dashboard/company/my-projects" className="btn btn-secondary">Manage Projects</Link>
              <Link to="/dashboard/company/find-developers" className="btn btn-secondary">Find Developers</Link>
              <Link to="/dashboard/company/payments" className="btn btn-secondary">Payment History</Link>
            </div>

            <div className="hiring-tips">
              <h3>Hiring Tips</h3>
              <ul>
                <li>Write clear project descriptions</li>
                <li>Set realistic budgets and timelines</li>
                <li>Review developer portfolios carefully</li>
                <li>Communicate requirements clearly</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard