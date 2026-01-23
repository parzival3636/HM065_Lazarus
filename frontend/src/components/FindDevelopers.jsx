import { useState, useEffect } from 'react'
import { getUserProfile, getDevelopers } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const FindDevelopers = () => {
  const [user, setUser] = useState(null)
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    skills: '',
    experience: '',
    availability: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }
        
        const developersResult = await fetchRealDevelopers()
        if (developersResult.developers) {
          setDevelopers(developersResult.developers)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchRealDevelopers = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch('http://127.0.0.1:8000/api/auth/developers/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        return { developers: data.developers || [] }
      }
    } catch (error) {
      console.error('Failed to fetch developers:', error)
    }
    return { developers: [] }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="projects-header">
          <h1>Find Developers</h1>
          <div className="filters">
            <select name="experience" value={filters.experience} onChange={handleFilterChange}>
              <option value="">All Experience</option>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <select name="availability" value={filters.availability} onChange={handleFilterChange}>
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
        </div>

        <div className="projects-grid">
          {developers.length > 0 ? (
            developers.map(developer => (
              <div key={developer.id} className="project-card">
                <h3>{developer.name}</h3>
                <p className="company">{developer.title}</p>
                <p className="description">{developer.location}</p>
                <div className="project-meta">
                  <span className="budget">${developer.hourly_rate}/hr</span>
                  <span className="posted-date">⭐ {developer.rating}</span>
                </div>
                <div className="skills">
                  {developer.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <p>Experience: {developer.experience}</p>
                <div className="project-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.open(`/developer/${developer.email}`, '_blank')}
                  >
                    View Profile
                  </button>
                  <button className="btn btn-secondary">Send Message</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No developers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FindDevelopers