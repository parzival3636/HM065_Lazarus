import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/developer/${developerId}/profile/`, {
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

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="profile-header">
          <h1>Developer Profile</h1>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Back
          </button>
        </div>

        {developer ? (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-avatar">
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {developer.name ? developer.name.charAt(0).toUpperCase() : 'D'}
                </div>
              </div>

              <div className="profile-info">
                <h2>{developer.name}</h2>
                <p className="title">{developer.title}</p>
                <p className="email">{developer.email}</p>

                <div className="stats-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px',
                  marginTop: '20px'
                }}>
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
                  <div className="bio-section" style={{ marginTop: '20px' }}>
                    <h3>About</h3>
                    <p>{developer.bio}</p>
                  </div>
                )}

                {developer.skills && (
                  <div className="skills-section" style={{ marginTop: '20px' }}>
                    <h3>Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {developer.skills.split(',').map((skill, idx) => (
                        <span key={idx} style={{
                          background: '#4CAF50',
                          color: 'white',
                          padding: '6px 15px',
                          borderRadius: '15px',
                          fontSize: '14px'
                        }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(developer.portfolio || developer.github || developer.linkedin) && (
                  <div className="links-section" style={{ marginTop: '20px' }}>
                    <h3>Links</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {developer.portfolio && (
                        <a href={developer.portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                          Portfolio
                        </a>
                      )}
                      {developer.github && (
                        <a href={developer.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                          GitHub
                        </a>
                      )}
                      {developer.linkedin && (
                        <a href={developer.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
