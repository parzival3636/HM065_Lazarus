import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProfile, createProject } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const PostProject = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    timeline: '',
    skills: '',
    experience: '',
    projectType: 'fixed'
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await getUserProfile()
        if (result.user) {
          setUser(result.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createProject(formData)
      
      if (result.error) {
        console.error('Project creation failed:', result.error)
      } else {
        navigate('/dashboard/company/my-projects')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="loading">Loading...</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="profile-header">
          <h1>Post New Project</h1>
        </div>

        <div className="profile-content">
          <form onSubmit={handleSubmit}>
            <div className="profile-section">
              <h3>Project Details</h3>
              <input
                type="text"
                name="title"
                placeholder="Project Title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              
              <textarea
                name="description"
                placeholder="Project Description"
                rows="5"
                value={formData.description}
                onChange={handleInputChange}
                required
              />

              <div className="form-row">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="ui-ux-design">UI/UX Design</option>
                  <option value="data-science">Data Science</option>
                </select>

                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Experience Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="profile-section">
              <h3>Budget & Timeline</h3>
              <div className="form-row">
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>

                <input
                  type="text"
                  name="budget"
                  placeholder="Budget (e.g., $1000-$5000)"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <input
                type="text"
                name="timeline"
                placeholder="Timeline (e.g., 2-4 weeks)"
                value={formData.timeline}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="profile-section">
              <h3>Required Skills</h3>
              <textarea
                name="skills"
                placeholder="Required skills (comma separated)"
                rows="3"
                value={formData.skills}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Posting...' : 'Post Project'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard/company')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostProject