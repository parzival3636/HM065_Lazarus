import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getUserProfile()
        if (result.user) {
          setUser(result.user)
          setFormData({
            first_name: result.user.first_name || '',
            last_name: result.user.last_name || '',
            title: '',
            bio: '',
            skills: ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) return <div className="loading">Loading profile...</div>
  if (!user) return <div>Please login to view profile</div>

  return (
    <div className="dashboard-container">
      <Navbar user={user} />
      <div className="dashboard-wrapper">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{color: '#374151', margin: 0}}>My Profile</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setEditing(!editing)}
            style={{
              background: editing ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(102, 126, 234, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)'
          }}>
            <h3 style={{color: '#374151', marginBottom: '1.5rem', fontSize: '1.25rem'}}>Basic Information</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>First Name</label>
                <input 
                  type="text" 
                  value={editing ? formData.first_name : user.first_name || ''} 
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!editing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    backgroundColor: editing ? '#ffffff' : '#f8faff',
                    color: '#374151'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Last Name</label>
                <input 
                  type="text" 
                  value={editing ? formData.last_name : user.last_name || ''} 
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!editing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    backgroundColor: editing ? '#ffffff' : '#f8faff',
                    color: '#374151'
                  }}
                />
              </div>
            </div>
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>Email</label>
              <input 
                type="email" 
                value={user.email || ''} 
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  backgroundColor: '#f0f4ff',
                  color: '#6b7280'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>User Type</label>
              <input 
                type="text" 
                value={user.user_type === 'developer' ? 'Developer' : 'Company'} 
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  backgroundColor: '#f0f4ff',
                  color: '#6b7280'
                }}
              />
            </div>
          </div>

          {user.user_type === 'developer' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(102, 126, 234, 0.15)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)'
            }}>
              <h3 style={{color: '#374151', marginBottom: '1.5rem', fontSize: '1.25rem'}}>Professional Information</h3>
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Professional Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Full Stack Developer"
                  value={editing ? formData.title : ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={!editing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    backgroundColor: editing ? '#ffffff' : '#f8faff',
                    color: '#374151'
                  }}
                />
              </div>
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Bio</label>
                <textarea 
                  placeholder="Tell clients about yourself..."
                  rows="4"
                  value={editing ? formData.bio : ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!editing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    backgroundColor: editing ? '#ffffff' : '#f8faff',
                    color: '#374151',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Skills</label>
                <input 
                  type="text" 
                  placeholder="React, Node.js, Python..."
                  value={editing ? formData.skills : ''}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  disabled={!editing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    backgroundColor: editing ? '#ffffff' : '#f8faff',
                    color: '#374151'
                  }}
                />
              </div>
            </div>
          )}

          {editing && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              padding: '1.5rem',
              background: '#f8faff',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <button 
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  padding: '0.75rem 2rem'
                }}
              >
                Save Changes
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setEditing(false)}
                style={{
                  padding: '0.75rem 2rem'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <Link 
          to="/dashboard/developer" 
          style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem'
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Profile