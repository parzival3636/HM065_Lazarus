import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './DeveloperProfileView.css'

const DeveloperProfileView = () => {
  const { developerId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }

        // Fetch developer profile
        const session = JSON.parse(localStorage.getItem('session') || '{}')
        const response = await fetch(`http://127.0.0.1:8000/api/auth/developer/${developerId}/profile/`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setDeveloper(data.developer)
        }
      } catch (error) {
        console.error('Failed to fetch developer profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [developerId])

  if (loading) return <div className="loading">Loading profile...</div>
  if (!user) return <div className="loading">Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="profile-view-container">
        <div className="profile-view-header">
          <h1>Developer Profile</h1>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
        </div>

        {developer ? (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-header-section">
                <div className="profile-avatar">
                  {developer.name ? developer.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div className="profile-header-info">
                  <h2>{developer.name}</h2>
                  <p className="title">{developer.title}</p>
                  <p className="email">{developer.email}</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <strong>Rating</strong>
                  <p>⭐ {developer.rating || 0}/5.0</p>
                </div>
                <div className="stat-card">
                  <strong>Experience</strong>
                  <p>{developer.years_experience || 0} years</p>
                </div>
                <div className="stat-card">
                  <strong>Projects</strong>
                  <p>{developer.total_projects || 0}</p>
                </div>
                <div className="stat-card">
                  <strong>Success Rate</strong>
                  <p>{developer.success_rate || 0}%</p>
                </div>
              </div>

              {developer.bio && (
                <div className="profile-section bio-section">
                  <h3>About</h3>
                  <p>{developer.bio}</p>
                </div>
              )}

              {developer.skills && (
                <div className="profile-section skills-section">
                  <h3>Skills</h3>
                  <div className="skills-container">
                    {developer.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="skill-badge">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(developer.portfolio || developer.github || developer.linkedin) && (
                <div className="profile-section links-section">
                  <h3>Links</h3>
                  <div className="links-container">
                    {developer.portfolio && (
                      <a href={developer.portfolio} target="_blank" rel="noopener noreferrer" className="link-button portfolio">
                        Portfolio
                      </a>
                    )}
                    {developer.github && (
                      <a href={developer.github} target="_blank" rel="noopener noreferrer" className="link-button github">
                        GitHub
                      </a>
                    )}
                    {developer.linkedin && (
                      <a href={developer.linkedin} target="_blank" rel="noopener noreferrer" className="link-button linkedin">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Developer profile not found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeveloperProfileView
