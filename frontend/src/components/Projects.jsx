import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Projects.css'

const Projects = () => {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [complexityFilter, setComplexityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showPostForm, setShowPostForm] = useState(false)
  const [bookmarkedProjects, setBookmarkedProjects] = useState(new Set())
  
  const techStacks = ['React', 'Node.js', 'Python', 'Django', 'Vue.js', 'Angular', 'Flutter', 'React Native', 'PHP', 'Laravel', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker']
  
  const mockProjects = [
    {
      id: 1,
      title: 'E-commerce Mobile App with Payment Integration',
      company: 'TechCorp Inc.',
      budget: '$1500-2500',
      budgetHidden: false,
      deadline: '2024-03-15',
      startDate: '2024-02-01',
      complexity: 'Complex',
      category: 'mobile',
      techStack: ['React Native', 'Node.js', 'MongoDB', 'Stripe'],
      description: 'We need a complete mobile e-commerce application with user authentication, product catalog, shopping cart, and secure payment processing.',
      deliverables: ['Mobile App (iOS & Android)', 'Admin Dashboard', 'API Documentation', 'Testing & Deployment'],
      tags: ['E-commerce', 'Payment', 'Mobile'],
      applicants: 12,
      views: 156,
      postedDate: '2024-01-15',
      estimatedDuration: '6-8 weeks'
    },
    {
      id: 2,
      title: 'Modern SaaS Dashboard Design',
      company: 'StartupXYZ',
      budget: '$800-1200',
      budgetHidden: false,
      deadline: '2024-02-28',
      startDate: '2024-02-05',
      complexity: 'Medium',
      category: 'design',
      techStack: ['Figma', 'Adobe XD', 'Principle'],
      description: 'Looking for a UI/UX designer to create a modern, intuitive dashboard for our SaaS platform with data visualization components.',
      deliverables: ['Wireframes', 'High-fidelity Designs', 'Prototype', 'Design System'],
      tags: ['SaaS', 'Dashboard', 'Data Visualization'],
      applicants: 8,
      views: 89,
      postedDate: '2024-01-18',
      estimatedDuration: '3-4 weeks'
    },
    {
      id: 3,
      title: 'AI-Powered Chatbot Development',
      company: 'InnovateLab',
      budget: 'Budget Hidden',
      budgetHidden: true,
      deadline: '2024-04-10',
      startDate: '2024-02-15',
      complexity: 'Very Complex',
      category: 'ai_ml',
      techStack: ['Python', 'TensorFlow', 'OpenAI API', 'FastAPI'],
      description: 'Develop an intelligent chatbot with natural language processing capabilities for customer support automation.',
      deliverables: ['Chatbot Engine', 'Training Data Processing', 'API Integration', 'Documentation'],
      tags: ['AI', 'NLP', 'Chatbot', 'Machine Learning'],
      applicants: 5,
      views: 234,
      postedDate: '2024-01-20',
      estimatedDuration: '8-10 weeks'
    }
  ]

  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    category: '',
    techStack: [],
    complexity: '',
    startDate: '',
    deadline: '',
    budgetMin: '',
    budgetMax: '',
    budgetHidden: false,
    deliverables: [''],
    tags: ''
  })

  const filteredProjects = mockProjects.filter(project => {
    const matchesCategory = filter === 'all' || project.category === filter
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesComplexity = complexityFilter === 'all' || project.complexity.toLowerCase().replace(' ', '_') === complexityFilter
    
    return matchesCategory && matchesSearch && matchesComplexity
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch(sortBy) {
      case 'newest': return new Date(b.postedDate) - new Date(a.postedDate)
      case 'deadline': return new Date(a.deadline) - new Date(b.deadline)
      case 'budget': return (b.budgetHidden ? 0 : parseInt(b.budget.split('-')[1]?.replace(/[^0-9]/g, '') || 0)) - 
                           (a.budgetHidden ? 0 : parseInt(a.budget.split('-')[1]?.replace(/[^0-9]/g, '') || 0))
      default: return 0
    }
  })

  const toggleBookmark = (projectId) => {
    const newBookmarks = new Set(bookmarkedProjects)
    if (newBookmarks.has(projectId)) {
      newBookmarks.delete(projectId)
    } else {
      newBookmarks.add(projectId)
    }
    setBookmarkedProjects(newBookmarks)
  }

  const handlePostFormChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'techStack') {
      const updatedTechStack = checked 
        ? [...postFormData.techStack, value]
        : postFormData.techStack.filter(tech => tech !== value)
      setPostFormData({...postFormData, techStack: updatedTechStack})
    } else if (name === 'deliverables') {
      const index = parseInt(e.target.dataset.index)
      const newDeliverables = [...postFormData.deliverables]
      newDeliverables[index] = value
      setPostFormData({...postFormData, deliverables: newDeliverables})
    } else {
      setPostFormData({...postFormData, [name]: type === 'checkbox' ? checked : value})
    }
  }

  const addDeliverable = () => {
    setPostFormData({...postFormData, deliverables: [...postFormData.deliverables, '']})
  }

  const removeDeliverable = (index) => {
    const newDeliverables = postFormData.deliverables.filter((_, i) => i !== index)
    setPostFormData({...postFormData, deliverables: newDeliverables})
  }

  return (
    <div className="projects">
      <nav className="projects-nav">
        <div className="nav-brand">DevConnect</div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <button 
            className="btn btn-primary"
            onClick={() => setShowPostForm(true)}
          >
            Post Project
          </button>
          <Link to="/">Logout</Link>
        </div>
      </nav>

      <div className="projects-content">
        <div className="projects-header">
          <h1>Discover Projects</h1>
          
          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search projects, tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="web">Web Development</option>
                <option value="mobile">Mobile Development</option>
                <option value="design">UI/UX Design</option>
                <option value="backend">Backend</option>
                <option value="ai_ml">AI/ML</option>
                <option value="blockchain">Blockchain</option>
              </select>
              
              <select value={complexityFilter} onChange={(e) => setComplexityFilter(e.target.value)}>
                <option value="all">All Complexity</option>
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
                <option value="very_complex">Very Complex</option>
              </select>
              
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="deadline">Deadline</option>
                <option value="budget">Budget (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="projects-stats">
          <span>{sortedProjects.length} projects found</span>
        </div>

        <div className="projects-grid">
          {sortedProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-title-section">
                  <h3>{project.title}</h3>
                  <button 
                    className={`bookmark-btn ${bookmarkedProjects.has(project.id) ? 'bookmarked' : ''}`}
                    onClick={() => toggleBookmark(project.id)}
                  >
                    {bookmarkedProjects.has(project.id) ? '★' : '☆'}
                  </button>
                </div>
                <div className="project-badges">
                  <span className={`complexity-badge ${project.complexity.toLowerCase().replace(' ', '-')}`}>
                    {project.complexity}
                  </span>
                  <span className="budget-badge">{project.budget}</span>
                </div>
              </div>
              
              <div className="project-company">
                <span className="company-name">{project.company}</span>
                <div className="project-stats">
                  <span>👁 {project.views}</span>
                  <span>👥 {project.applicants} applied</span>
                </div>
              </div>
              
              <p className="project-description">{project.description}</p>
              
              <div className="project-timeline">
                <span>📅 Start: {project.startDate}</span>
                <span>⏰ Deadline: {project.deadline}</span>
                <span>⏱ Duration: {project.estimatedDuration}</span>
              </div>
              
              <div className="project-tech-stack">
                <h4>Tech Stack:</h4>
                <div className="tech-tags">
                  {project.techStack.map(tech => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
              
              <div className="project-deliverables">
                <h4>Deliverables:</h4>
                <ul>
                  {project.deliverables.slice(0, 2).map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                  {project.deliverables.length > 2 && <li>+{project.deliverables.length - 2} more...</li>}
                </ul>
              </div>
              
              <div className="project-tags">
                {project.tags.map(tag => (
                  <span key={tag} className="project-tag">{tag}</span>
                ))}
              </div>
              
              <div className="project-actions">
                <button className="btn btn-primary">Apply Now</button>
                <button className="btn btn-secondary">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPostForm && (
        <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
          <div className="post-project-modal" onClick={e => e.stopPropagation()}>
            <h2>Post New Project</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-section">
                <h3>Project Details</h3>
                <input 
                  type="text" 
                  name="title"
                  placeholder="Project Title" 
                  value={postFormData.title}
                  onChange={handlePostFormChange}
                  required 
                />
                <textarea 
                  name="description"
                  placeholder="Detailed Project Description" 
                  rows="4" 
                  value={postFormData.description}
                  onChange={handlePostFormChange}
                  required
                />
                
                <div className="form-row">
                  <select name="category" value={postFormData.category} onChange={handlePostFormChange} required>
                    <option value="">Select Category</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="design">UI/UX Design</option>
                    <option value="backend">Backend Development</option>
                    <option value="ai_ml">AI/Machine Learning</option>
                    <option value="blockchain">Blockchain</option>
                  </select>
                  
                  <select name="complexity" value={postFormData.complexity} onChange={handlePostFormChange} required>
                    <option value="">Project Complexity</option>
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                    <option value="very_complex">Very Complex</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Tech Stack</h3>
                <div className="tech-stack-grid">
                  {techStacks.map(tech => (
                    <label key={tech} className="tech-checkbox">
                      <input
                        type="checkbox"
                        name="techStack"
                        value={tech}
                        checked={postFormData.techStack.includes(tech)}
                        onChange={handlePostFormChange}
                      />
                      {tech}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Timeline & Budget</h3>
                <div className="form-row">
                  <input 
                    type="date" 
                    name="startDate"
                    placeholder="Start Date"
                    value={postFormData.startDate}
                    onChange={handlePostFormChange}
                    required
                  />
                  <input 
                    type="date" 
                    name="deadline"
                    placeholder="Deadline"
                    value={postFormData.deadline}
                    onChange={handlePostFormChange}
                    required
                  />
                </div>
                
                <div className="budget-section">
                  <label className="budget-checkbox">
                    <input
                      type="checkbox"
                      name="budgetHidden"
                      checked={postFormData.budgetHidden}
                      onChange={handlePostFormChange}
                    />
                    Hide Budget Range
                  </label>
                  
                  {!postFormData.budgetHidden && (
                    <div className="form-row">
                      <input 
                        type="number" 
                        name="budgetMin"
                        placeholder="Min Budget (Rs)"
                        value={postFormData.budgetMin}
                        onChange={handlePostFormChange}
                      />
                      <input 
                        type="number" 
                        name="budgetMax"
                        placeholder="Max Budget (Rs)"
                        value={postFormData.budgetMax}
                        onChange={handlePostFormChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>Deliverables</h3>
                {postFormData.deliverables.map((deliverable, index) => (
                  <div key={index} className="deliverable-row">
                    <input
                      type="text"
                      name="deliverables"
                      data-index={index}
                      placeholder={`Deliverable ${index + 1}`}
                      value={deliverable}
                      onChange={handlePostFormChange}
                    />
                    {postFormData.deliverables.length > 1 && (
                      <button type="button" onClick={() => removeDeliverable(index)}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addDeliverable} className="add-deliverable-btn">
                  + Add Deliverable
                </button>
              </div>

              <div className="form-section">
                <input 
                  type="text" 
                  name="tags"
                  placeholder="Tags (comma separated)"
                  value={postFormData.tags}
                  onChange={handlePostFormChange}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowPostForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects