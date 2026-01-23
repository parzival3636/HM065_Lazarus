import { useState } from 'react'

const AssignProjectButton = ({ applicationId, onAssignSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleAssign = async () => {
    setLoading(true)
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/assignments/assign_project/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ application_id: applicationId })
        }
      )

      const data = await response.json()

      if (response.ok) {
        alert('Project assigned successfully!')
        setShowConfirm(false)
        if (onAssignSuccess) {
          onAssignSuccess(data)
        }
      } else {
        alert(`Error: ${data.error || 'Failed to assign project'}`)
      }
    } catch (error) {
      console.error('Error assigning project:', error)
      alert('Failed to assign project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          padding: '1rem 2rem',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.95rem',
          cursor: 'pointer',
          border: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          boxShadow: '0 8px 25px -5px rgba(16, 185, 129, 0.5)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 12px 35px -5px rgba(16, 185, 129, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 8px 25px -5px rgba(16, 185, 129, 0.5)'
        }}
      >
        Assign Project
      </button>

      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '500px',
            color: '#fff'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Assign Project?</h2>
            <p style={{ color: '#d4d4d8', marginBottom: '2rem', lineHeight: '1.6' }}>
              This developer will receive a congratulations message and have 1 week to submit Figma designs and 30 days to complete the project.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? 'Assigning...' : 'Confirm Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AssignProjectButton
