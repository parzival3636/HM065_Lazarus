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
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div>
                <label>First Name</label>
                <input 
                  type="text" 
                  value={editing ? formData.first_name : user.first_name || ''} 
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div>
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={editing ? formData.last_name : user.last_name || ''} 
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!editing}
                />
              </div>
            </div>
            <div>
              <label>Email</label>
              <input 
                type="email" 
                value={user.email || ''} 
                disabled
              />
            </div>
            <div>
              <label>User Type</label>
              <input 
                type="text" 
                value={user.user_type === 'developer' ? 'Developer' : 'Company'} 
                disabled
              />
            </div>
          </div>

          {user.user_type === 'developer' && (
            <div className="profile-section">
              <h3>Professional Information</h3>
              <div>
                <label>Professional Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Full Stack Developer"
                  value={editing ? formData.title : ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div>
                <label>Bio</label>
                <textarea 
                  placeholder="Tell clients about yourself..."
                  rows="4"
                  value={editing ? formData.bio : ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div>
                <label>Skills</label>
                <input 
                  type="text" 
                  placeholder="React, Node.js, Python..."
                  value={editing ? formData.skills : ''}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  disabled={!editing}
                />
              </div>
            </div>
          )}

          {editing && (
            <div className="profile-actions">
              <button className="btn btn-primary">Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile