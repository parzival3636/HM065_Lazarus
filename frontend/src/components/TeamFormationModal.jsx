import { useState } from 'react'
import { createTeam } from '../services/api'
import './Dashboard.css'

const TeamFormationModal = ({ applications, projectId, onClose, onTeamCreated }) => {
  const [selectedApps, setSelectedApps] = useState([])
  const [teamName, setTeamName] = useState('Team 1')
  const [loading, setLoading] = useState(false)

  const handleAppSelection = (app, checked) => {
    if (checked) {
      setSelectedApps([...selectedApps, {...app, role: 'Developer'}])
    } else {
      setSelectedApps(selectedApps.filter(a => a.id !== app.id))
    }
  }

  const handleRoleChange = (appId, role) => {
    setSelectedApps(selectedApps.map(app => 
      app.id === appId ? {...app, role} : app
    ))
  }

  const calculateTeamMetrics = () => {
    const totalCost = selectedApps.reduce((sum, app) => sum + (app.proposed_rate || 50) * 40, 0)
    const avgScore = selectedApps.reduce((sum, app) => sum + (app.match_score || 0), 0) / selectedApps.length
    return { totalCost, avgScore: avgScore || 0 }
  }

  const handleCreateTeam = async () => {
    if (selectedApps.length === 0) {
      alert('Please select at least one developer')
      return
    }

    setLoading(true)
    try {
      const result = await createTeam({
        project_id: projectId,
        selected_applications: selectedApps,
        team_name: teamName
      })

      if (result.success) {
        onTeamCreated(result.team)
        onClose()
      } else {
        alert('Failed to create team: ' + result.error)
      }
    } catch (error) {
      alert('Error creating team: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const { totalCost, avgScore } = calculateTeamMetrics()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px', width: '90%'}}>
        <div className="modal-header">
          <h2>🤖 Create Smart Team</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{padding: '20px'}}>
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Team Name:</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333'}}
            />
          </div>

          <div style={{marginBottom: '20px'}}>
            <h3>Select Team Members:</h3>
            <div style={{maxHeight: '300px', overflowY: 'auto'}}>
              {applications.map(app => (
                <div key={app.id} className="application-card" style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px',
                  padding: '15px',
                  margin: '10px 0',
                  border: selectedApps.find(a => a.id === app.id) ? '2px solid #007bff' : '1px solid #333'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedApps.some(a => a.id === app.id)}
                    onChange={(e) => handleAppSelection(app, e.target.checked)}
                    style={{width: '20px', height: '20px'}}
                  />
                  <div style={{flex: 1}}>
                    <h4 style={{margin: '0 0 5px 0'}}>{app.developer_name}</h4>
                    <p style={{margin: '0', color: '#ccc'}}>
                      Score: {app.match_score}% | Rate: ₹{(app.proposed_rate || 50).toLocaleString('en-IN')}/hr
                    </p>
                  </div>
                  {selectedApps.find(a => a.id === app.id) && (
                    <select
                      value={selectedApps.find(a => a.id === app.id)?.role || 'Developer'}
                      onChange={(e) => handleRoleChange(app.id, e.target.value)}
                      style={{padding: '5px', borderRadius: '4px'}}
                    >
                      <option value="Developer">Developer</option>
                      <option value="Frontend Lead">Frontend Lead</option>
                      <option value="Backend Lead">Backend Lead</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Project Manager">Project Manager</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedApps.length > 0 && (
            <div className="stat-card" style={{marginBottom: '20px'}}>
              <h4>Team Summary:</h4>
              <p>👥 Members: {selectedApps.length}</p>
              <p>💰 Estimated Cost: ₹{totalCost.toLocaleString('en-IN', {maximumFractionDigits: 2})} (40 hours)</p>
              <p>📊 Average Score: {avgScore.toFixed(1)}%</p>
            </div>
          )}

          <div className="modal-actions">
            <button 
              onClick={handleCreateTeam}
              disabled={loading || selectedApps.length === 0}
              className="btn btn-primary"
              style={{marginRight: '10px'}}
            >
              {loading ? '⏳ Creating...' : '🚀 Create Team'}
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamFormationModal