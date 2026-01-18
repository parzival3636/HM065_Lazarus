import { useState, useEffect } from 'react'
import { getUserProfile, getProjects, applyToProject } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const ProjectBrowser = () => {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedTechStack, setSelectedTechStack] = useState('')
  const [sortOrder, setSortOrder] = useState('latest')
  const [allTechStacks, setAllTechStacks] = useState([])
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedBudget: '',
    timeline: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }
        
        const projectsResult = await getProjects()
        if (projectsResult.projects) {
          setProjects(projectsResult.projects)
          
          // Extract all unique tech stacks
          const techStacks = new Set()
          projectsResult.projects.forEach(project => {
            if (project.tech_stack && Array.isArray(project.tech_stack)) {
              project.tech_stack.forEach(tech => {
                techStacks.add(tech)
              })
            }
          })
          setAllTechStacks(Array.from(techStacks).sort())
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects]

    // Filter by tech stack
    if (selectedTechStack) {
      filtered = filtered.filter(project => {
        if (!project.tech_stack || !Array.isArray(project.tech_stack)) return false
        return project.tech_stack.some(tech => 
          tech.toLowerCase().includes(selectedTechStack.toLowerCase()) ||
          selectedTechStack.toLowerCase().includes(tech.toLowerCase())
        )
      })
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB
    })

    setFilteredProjects(filtered)
  }, [projects, selectedTechStack, sortOrder])

  const formatBudget = (min, max) => {
    if (min === max) return `$${min}`
    return `$${min} - $${max}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleApplyClick = (project) => {
    setSelectedProject(project)
    setApplicationData({
      coverLetter: '',
      proposedBudget: project.budget_min || '',
      timeline: project.estimated_duration || ''
    })
  }

  const handleApplicationSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await applyToProject(selectedProject.id, applicationData)
      if (result.message) {
        alert('Application submitted successfully!')
        setSelectedProject(null)
        setApplicationData({ coverLetter: '', proposedBudget: '', timeline: '' })
      }
    } catch (error) {
      console.error('Failed to submit application:', error)
      alert('Failed to submit application')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="profile-header">
          <h1>Browse Projects</h1>
          <p>Find projects that match your skills</p>
        </div>

        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          {/* Tech Stack Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <label style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Filter by Tech:
            </label>
            <select
              value={selectedTechStack}
              onChange={(e) => setSelectedTechStack(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.95rem',
                minWidth: '200px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.12)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <option value="">All Technologies</option>
              {allTechStacks.map(tech => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <label style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Sort by:
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.95rem',
                minWidth: '180px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.12)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Results Count */}
          <div style={{
            color: '#a1a1aa',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p className="description">{project.description}</p>
                <div className="project-meta">
                  <span className="budget">{formatBudget(project.budget_min, project.budget_max)}</span>
                  <span className="category">{project.category}</span>
                  <span className="complexity">{project.complexity}</span>
                </div>
                <div className="skills">
                  {project.tech_stack && project.tech_stack.map(tech => (
                    <span key={tech} className="skill-tag">{tech}</span>
                  ))}
                </div>
                <p>Duration: {project.estimated_duration}</p>
                <p>Posted: {formatDate(project.created_at)}</p>
                <div className="project-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApplyClick(project)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No projects found matching your filters.</p>
              {selectedTechStack && (
                <button
                  onClick={() => setSelectedTechStack('')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Application Modal */}
        {selectedProject && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Apply to: {selectedProject.title}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedProject(null)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleApplicationSubmit} className="application-form">
                <div className="form-group">
                  <label>Cover Letter *</label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                    placeholder="Explain why you're the perfect fit for this project..."
                    required
                    rows="6"
                  />
                </div>
                
                <div className="form-group">
                  <label>Proposed Budget ($)</label>
                  <input
                    type="number"
                    value={applicationData.proposedBudget}
                    onChange={(e) => setApplicationData({...applicationData, proposedBudget: e.target.value})}
                    placeholder="Your proposed budget"
                  />
                </div>
                
                <div className="form-group">
                  <label>Estimated Timeline</label>
                  <input
                    type="text"
                    value={applicationData.timeline}
                    onChange={(e) => setApplicationData({...applicationData, timeline: e.target.value})}
                    placeholder="e.g., 2 weeks"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Submit Application
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setSelectedProject(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectBrowser
