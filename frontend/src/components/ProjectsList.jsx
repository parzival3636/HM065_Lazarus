import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Projects.css'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setProjects([
        {
          id: 1,
          title: 'E-commerce Website Development',
          description: 'Build a modern e-commerce platform with React and Node.js',
          budget: '$2000-$5000',
          skills: ['React', 'Node.js', 'MongoDB'],
          postedDate: '2 days ago',
          company: 'TechCorp Inc.'
        },
        {
          id: 2,
          title: 'Mobile App UI/UX Design',
          description: 'Design user interface for a fitness tracking mobile application',
          budget: '$1500-$3000',
          skills: ['UI/UX', 'Figma', 'Mobile Design'],
          postedDate: '1 week ago',
          company: 'FitLife Solutions'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) return <div className="loading">Loading projects...</div>

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Browse Projects</h1>
        <div className="filters">
          <select>
            <option>All Categories</option>
            <option>Web Development</option>
            <option>Mobile Development</option>
            <option>UI/UX Design</option>
          </select>
          <select>
            <option>All Budgets</option>
            <option>$500-$1000</option>
            <option>$1000-$5000</option>
            <option>$5000+</option>
          </select>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <h3>{project.title}</h3>
            <p className="company">{project.company}</p>
            <p className="description">{project.description}</p>
            <div className="project-meta">
              <span className="budget">{project.budget}</span>
              <span className="posted-date">{project.postedDate}</span>
            </div>
            <div className="skills">
              {project.skills.map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
            <button className="btn btn-primary">Apply Now</button>
          </div>
        ))}
      </div>

      <Link to="/dashboard/developer" className="back-link">← Back to Dashboard</Link>
    </div>
  )
}

export default ProjectsList