import { useState, useEffect } from 'react'
import { getDeveloperPortfolio, createPortfolioProject, updatePortfolioProject, deletePortfolioProject, incrementPortfolioViews } from '../services/api'
import Navbar from './Navbar'
import './Portfolio.css'

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
      <div className="portfolio-container">
        <div className="portfolio-header">
          <h1>My Portfolio</h1>
          <p>Showcase your best work</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Project'}
          </button>
        </div>

        {/* Add Project Form */}
        {showForm && (
          <div className="portfolio-form">
            <h2>Add New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., E-commerce Platform"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Project Images * (at least 1)</label>
                <div className="image-input-group">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Enter image URL"
                  />
                  <button type="button" onClick={handleAddImage} className="btn btn-secondary">
                    Add Image
                  </button>
                </div>
                <div className="image-list">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="image-item">
                      <img src={img} alt={`Project ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Video URL (Optional)</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="e.g., https://youtube.com/watch?v=..."
                />
              </div>

              <div className="form-group">
                <label>Project URL</label>
                <input
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => setFormData({...formData, project_url: e.target.value})}
                  placeholder="https://myproject.com"
                />
              </div>

              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                  placeholder="https://github.com/user/project"
                />
              </div>

              <div className="form-group">
                <label>Tech Stack</label>
                <div className="tech-input-group">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g., React"
                  />
                  <button type="button" onClick={handleAddTech} className="btn btn-secondary">
                    Add Tech
                  </button>
                </div>
                <div className="tech-list">
                  {formData.tech_stack.map((tech, idx) => (
                    <span key={idx} className="tech-tag">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(idx)}
                        className="btn-remove-tag"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                />
                <label>Feature this project on my profile</label>
              </div>

              <button type="submit" className="btn btn-primary">
                Create Project
              </button>
            </form>
          </div>
        )}

        {/* Portfolio Grid */}
        <div className="portfolio-grid">
          {projects.length > 0 ? (
            projects.map(project => (
              <div
                key={project.id}
                className={`portfolio-card ${project.featured ? 'featured' : ''}`}
                onClick={() => handleProjectClick(project)}
              >
                <div className="card-image">
                  <img src={project.images[0]} alt={project.title} />
                  {project.featured && <span className="featured-badge">Featured</span>}
                  <div className="card-overlay">
                    <span className="views-count">👁️ {project.views_count}</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3>{project.title}</h3>
                  <p className="description">{project.description.substring(0, 100)}...</p>
                  <div className="tech-tags">
                    {project.tech_stack.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="tech-tag-small">{tech}</span>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <span className="tech-tag-small">+{project.tech_stack.length - 3}</span>
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
            <div className="modal-large" onClick={(e) => e.stopPropagation()}>
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
                    className="btn btn-danger"
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
