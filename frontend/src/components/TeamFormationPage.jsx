import { useState, useEffect } from 'react'
import { getCompanyProjects } from '../services/api'
import SmartTeamFormation from './SmartTeamFormation'
import Navbar from './Navbar'
import './Dashboard.css'

const TeamFormationPage = ({ user }) => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const result = await getCompanyProjects()
      if (result.projects) {
        setProjects(result.projects.filter(p => p.status === 'open' || p.status === 'active'))
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>🤖 Smart Team Formation</h1>
          <p>Get AI-powered team suggestions for your projects</p>
        </div>

        <div className="profile-section">
          <h3>Select a Project</h3>
          <div className="projects-grid">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
                onClick={() => setSelectedProject(project)}
                style={{cursor: 'pointer', border: selectedProject?.id === project.id ? '2px solid #007bff' : ''}}
              >
                <h4>{project.title}</h4>
                <p>Budget: ${project.budget_min} - ${project.budget_max}</p>
                <div className="skills">
                  {project.tech_stack?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProject && <SmartTeamFormation project={selectedProject} />}
      </div>
    </div>
  )
}

export default TeamFormationPage