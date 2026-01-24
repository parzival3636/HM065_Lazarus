import { useState, useEffect } from 'react'
import { getDeveloperPortfolio, createPortfolioProject, updatePortfolioProject, deletePortfolioProject, incrementPortfolioViews } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const DeveloperPortfolio = ({ user }) => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tech_stack: [],
    images: [],
    video_url: '',
    project_url: '',
    github_url: '',
    featured: false,
  })
  const [imageInput, setImageInput] = useState('')
  const [techInput, setTechInput] = useState('')

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      if (user && user.id) {
        const result = await getDeveloperPortfolio(user.id)
        if (result.projects) {
          setProjects(result.projects)
        }
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()]
      })
      setImageInput('')
    }
  }

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleAddTech = () => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        tech_stack: [...formData.tech_stack, techInput.trim()]
      })
      setTechInput('')
    }
  }

  const handleRemoveTech = (index) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.images.length === 0) {
      alert('Please add at least one image')
      return
    }

    if (!formData.title || !formData.description) {
      alert('Please fill in title and description')
      return
    }

    try {
      const result = await createPortfolioProject(formData)
      if (result.project) {
        setProjects([result.project, ...projects])
        setFormData({
          title: '',
          description: '',
          tech_stack: [],
          images: [],
          video_url: '',
          project_url: '',
          github_url: '',
          featured: false,
        })
        setShowForm(false)
        alert('Portfolio project created successfully!')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project')
    }
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deletePortfolioProject(projectId)
        setProjects(projects.filter(p => p.id !== projectId))
        setSelectedProject(null)
        setShowModal(false)
        alert('Project deleted successfully!')
      } catch (error) {
        console.error('Failed to delete project:', error)
        alert('Failed to delete project')
      }
    }
  }

  const handleProjectClick = async (project) => {
    setSelectedProject(project)
    setShowModal(true)
    // Increment view count
    try {
      await incrementPortfolioViews(project.id)
    } catch (error) {
      console.error('Failed to increment views:', error)
    }
  }

  if (loading) return <div className="loading">Loading portfolio...</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Portfolio</h1>
          <div className="user-info">
            <span>Showcase your best work</span>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ Add Project'}
            </button>
          </div>
        </div>

        {/* Add Project Form */}
        {showForm && (
          <div className="profile-section" style={{
            background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(0, 123, 255, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 123, 255, 0.2)'
          }}>
            <h3 style={{
              background: 'linear-gradient(135deg, #007bff 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.8rem',
              marginBottom: '30px',
              textAlign: 'center'
            }}>✨ Add New Project</h3>
            <form onSubmit={handleSubmit} style={{display: 'grid', gap: '20px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                  <label style={{color: '#007bff', fontWeight: '600', marginBottom: '8px', display: 'block'}}>🎯 Project Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., E-commerce Platform"
                    required
                    style={{
                      background: 'rgba(0, 123, 255, 0.05)',
                      border: '2px solid rgba(0, 123, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '15px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                <div>
                  <label style={{color: '#007bff', fontWeight: '600', marginBottom: '8px', display: 'block'}}>🎬 Video URL</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{
                      background: 'rgba(0, 123, 255, 0.05)',
                      border: '2px solid rgba(0, 123, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '15px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{color: '#007bff', fontWeight: '600', marginBottom: '8px', display: 'block'}}>📝 Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project in detail..."
                  rows="4"
                  required
                  style={{
                    background: 'rgba(0, 123, 255, 0.05)',
                    border: '2px solid rgba(0, 123, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '15px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                background: 'rgba(0, 123, 255, 0.05)',
                border: '2px dashed rgba(0, 123, 255, 0.3)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <label style={{color: '#007bff', fontWeight: '600', marginBottom: '12px', display: 'block'}}>🖼️ Project Images * (Use image URLs like Google Drive links)</label>
                <div className="image-input-group" style={{marginBottom: '15px'}}>
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Paste your image URL here..."
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(0, 123, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddImage} 
                    className="btn btn-secondary"
                    style={{
                      background: 'linear-gradient(135deg, #007bff, #0056b3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontWeight: '600'
                    }}
                  >
                    ➕ Add
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className="image-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px'}}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="image-item" style={{position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(0, 123, 255, 0.3)'}}>
                        <img src={img} alt={`Project ${idx + 1}`} style={{width: '100%', height: '100px', objectFit: 'cover'}} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="btn-remove"
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'rgba(220, 53, 69, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                  <label style={{color: '#007bff', fontWeight: '600', marginBottom: '8px', display: 'block'}}>🌐 Project URL</label>
                  <input
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData({...formData, project_url: e.target.value})}
                    placeholder="https://myproject.com"
                    style={{
                      background: 'rgba(0, 123, 255, 0.05)',
                      border: '2px solid rgba(0, 123, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '15px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{color: '#007bff', fontWeight: '600', marginBottom: '8px', display: 'block'}}>🐙 GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                    placeholder="https://github.com/user/project"
                    style={{
                      background: 'rgba(0, 123, 255, 0.05)',
                      border: '2px solid rgba(0, 123, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '15px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: 'rgba(118, 75, 162, 0.05)',
                border: '2px dashed rgba(118, 75, 162, 0.3)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <label style={{color: '#764ba2', fontWeight: '600', marginBottom: '12px', display: 'block'}}>⚡ Tech Stack</label>
                <div className="tech-input-group" style={{marginBottom: '15px'}}>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g., React, Node.js, MongoDB"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(118, 75, 162, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddTech} 
                    className="btn btn-secondary"
                    style={{
                      background: 'linear-gradient(135deg, #764ba2, #667eea)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontWeight: '600'
                    }}
                  >
                    ➕ Add
                  </button>
                </div>
                {formData.tech_stack.length > 0 && (
                  <div className="tech-list" style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                    {formData.tech_stack.map((tech, idx) => (
                      <span key={idx} style={{
                        background: 'linear-gradient(135deg, #764ba2, #667eea)',
                        color: 'white',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0'
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '15px',
                background: 'rgba(255, 193, 7, 0.1)',
                border: '2px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '12px'
              }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#ffc107'
                  }}
                />
                <label style={{margin: 0, color: '#ffc107', fontWeight: '600'}}>⭐ Feature this project on my profile</label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #007bff 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  boxShadow: '0 5px 20px rgba(0, 123, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                🚀 Create Project
              </button>
            </form>
          </div>
        )}

        {/* Portfolio Grid */}
        <div className="projects-grid">
          {projects.length > 0 ? (
            projects.map(project => (
              <div
                key={project.id}
                className={`project-card ${project.featured ? 'featured' : ''}`}
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-image" style={{position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '8px 8px 0 0'}}>
                  <img src={project.images[0]} alt={project.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  {project.featured && <span className="featured-badge" style={{position: 'absolute', top: '10px', right: '10px', background: '#ffd700', color: '#000', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'}}>Featured</span>}
                  <div style={{position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem'}}>👁️ {project.views_count}</div>
                </div>
                <div style={{padding: '20px'}}>
                  <h3 style={{color: '#fff', marginBottom: '10px'}}>{project.title}</h3>
                  <p className="description" style={{color: '#ccc', marginBottom: '15px', lineHeight: '1.5'}}>{project.description.substring(0, 100)}...</p>
                  <div className="skills" style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                    {project.tech_stack.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="skill-tag">{tech}</span>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <span className="skill-tag">+{project.tech_stack.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No portfolio projects yet. Add your first project!</p>
            </div>
          )}
        </div>

        {/* Project Modal */}
        {showModal && selectedProject && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedProject.title}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-content">
                {/* Image Gallery */}
                <div className="image-gallery">
                  <div className="main-image">
                    <img src={selectedProject.images[0]} alt={selectedProject.title} />
                  </div>
                  {selectedProject.images.length > 1 && (
                    <div className="thumbnail-gallery">
                      {selectedProject.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="thumbnail"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Video */}
                {selectedProject.video_url && (
                  <div className="video-section">
                    <h3>Project Video</h3>
                    <iframe
                      width="100%"
                      height="400"
                      src={selectedProject.video_url.replace('watch?v=', 'embed/')}
                      title="Project Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Description */}
                <div className="description-section">
                  <h3>About This Project</h3>
                  <p>{selectedProject.description}</p>
                </div>

                {/* Tech Stack */}
                <div className="tech-section">
                  <h3>Technologies Used</h3>
                  <div className="tech-list-large">
                    {selectedProject.tech_stack.map((tech, idx) => (
                      <span key={idx} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="links-section">
                  {selectedProject.project_url && (
                    <a href={selectedProject.project_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      View Live Project
                    </a>
                  )}
                  {selectedProject.github_url && (
                    <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                      View on GitHub
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button
                    className="btn"
                    style={{background: '#dc3545', color: 'white'}}
                    onClick={() => handleDelete(selectedProject.id)}
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeveloperPortfolio
