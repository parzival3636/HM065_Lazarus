import { useState } from 'react'
import { getTeamSuggestions } from '../services/api'
import './Dashboard.css'

const SmartTeamFormation = ({ project }) => {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGetSuggestions = async () => {
    setLoading(true)
    try {
      const result = await getTeamSuggestions({
        project_id: project.id,
        required_skills: project.tech_stack || [],
        budget: project.budget_max || 5000,
        team_size: 3
      })
      
      if (result.success) {
        setSuggestions(result.suggestions)
      }
    } catch (error) {
      console.error('Failed to get team suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-section">
      <h3>🤖 Smart Team Formation</h3>
      
      <button 
        onClick={handleGetSuggestions}
        className="btn btn-primary"
        disabled={loading}
        style={{marginBottom: '20px'}}
      >
        {loading ? '🔄 Analyzing...' : '✨ Get Optimal Team'}
      </button>

      {suggestions && (
        <div style={{display: 'grid', gap: '20px'}}>
          <div className="stat-card">
            <h4>💰 Estimated Cost: ₹{suggestions.total_cost.toLocaleString('en-IN')}</h4>
            <h4>📊 Team Score: {suggestions.team_score.toFixed(1)}/5</h4>
          </div>

          <div>
            <h4>👥 Suggested Team ({suggestions.team.length} members):</h4>
            <div className="projects-grid">
              {suggestions.team.map((dev, idx) => (
                <div key={idx} className="project-card">
                  <h4>{dev.name}</h4>
                  <p>💼 ₹{dev.hourly_rate.toLocaleString('en-IN')}/hr</p>
                  <p>⭐ {dev.rating}/5 rating</p>
                  <p>🎯 Match: {(dev.score * 100).toFixed(0)}%</p>
                  <div className="skills">
                    {dev.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4>🛠️ Skills Coverage:</h4>
            <div className="skills">
              {suggestions.skills_coverage.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartTeamFormation