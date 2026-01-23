import { useState, useEffect } from 'react'
import { getCompanyTeams, createCompanyTeam } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const TeamsManagement = ({ user }) => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    team_name: '',
    description: ''
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const result = await getCompanyTeams()
      if (result.success) {
        setTeams(result.teams)
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    try {
      const result = await createCompanyTeam(formData)
      if (result.success) {
        setTeams([...teams, result.team])
        setFormData({ team_name: '', description: '' })
        setShowCreateForm(false)
      } else {
        alert('Failed to create team: ' + result.error)
      }
    } catch (error) {
      alert('Error creating team: ' + error.message)
    }
  }

  if (loading) return <div className="loading">Loading teams...</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Team Management</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            + Create New Team
          </button>
        </div>

        <div className="projects-grid">
          {teams.map(team => (
            <div key={team.id} className="project-card">
              <h3>👥 {team.team_name}</h3>
              <p>{team.description || 'No description'}</p>
              <p>Members: {team.members_data?.length || 0}</p>
              <div style={{marginTop: '10px'}}>
                {team.members_data?.map(member => (
                  <div key={member.id} style={{fontSize: '0.9rem', color: '#ccc'}}>
                    • {member.name} - {member.role}
                  </div>
                ))}
              </div>
              <div className="project-actions" style={{marginTop: '15px'}}>
                <button className="btn btn-secondary">Edit Team</button>
              </div>
            </div>
          ))}
          
          {teams.length === 0 && (
            <div className="empty-state">
              <p>No teams created yet. Create your first team!</p>
            </div>
          )}
        </div>

        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Team</h2>
                <button className="close-btn" onClick={() => setShowCreateForm(false)}>✕</button>
              </div>

              <form onSubmit={handleCreateTeam} style={{padding: '20px'}}>
                <label>Team Name *</label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => setFormData({...formData, team_name: e.target.value})}
                  placeholder="e.g., Frontend Team"
                  required
                  style={{marginBottom: '15px'}}
                />

                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Team description..."
                  rows="3"
                  style={{marginBottom: '20px'}}
                />

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Team
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamsManagement