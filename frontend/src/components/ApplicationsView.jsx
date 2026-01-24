import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile, getProjectApplications } from '../services/api'
import Navbar from './Navbar'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const ApplicationsView = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getUserProfile()
        if (userResult.user) {
          setUser(userResult.user)
        }
        
        const applicationsResult = await getProjectApplications(projectId)
        if (applicationsResult.applications) {
          setApplications(applicationsResult.applications)
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const getScoreBadge = (score) => {
    if (!score) return 'Not Scored'
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  }

  const handleAssignProject = async (applicationId) => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/assign_project/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            application_id: applicationId
          })
        }
      )

      if (response.ok) {
        alert('Project assigned successfully!')
        // Refresh applications list
        const applicationsResult = await getProjectApplications(projectId)
        if (applicationsResult.applications) {
          setApplications(applicationsResult.applications)
        }
      } else {
        try {
          const data = await response.json()
          alert(`Error: ${data.error || 'Failed to assign project'}`)
        } catch (e) {
          alert(`Error: ${response.status} ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Error assigning project:', error)
      alert('Failed to assign project: ' + error.message)
    }
  }

  const handleViewProfile = (developerId) => {
    navigate(`/developer/${developerId}`)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Loading applications...
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        Please login to continue
      </div>
    )
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar user={user} />
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            margin: '0',
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em'
          }}>
            Project Applications
          </h1>
          <button
            onClick={() => navigate('/dashboard/company/my-projects')}
            style={{
              padding: '0.875rem 1.75rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(12px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.12)'
              e.target.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            ← Back to My Projects
          </button>
        </div>

        {/* Applications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {applications.length > 0 ? (
            applications.map(application => (
              <div
                key={application.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 20px 60px -15px rgba(99, 102, 241, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Developer Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '2rem',
                  alignItems: 'start',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: '#fff',
                      margin: '0 0 0.5rem 0',
                      letterSpacing: '-0.01em'
                    }}>
                      {application.developer_name || application.developer_email}
                    </h3>
                    <p style={{
                      fontSize: '1.125rem',
                      color: '#a1a1aa',
                      margin: '0.25rem 0',
                      fontWeight: '500'
                    }}>
                      {application.developer_title}
                    </p>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#71717a',
                      margin: '0.5rem 0 0 0'
                    }}>
                      {application.developer_email}
                    </p>
                  </div>

                  {/* ML Score Badge */}
                  <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    padding: '1.5rem 2rem',
                    borderRadius: '20px',
                    textAlign: 'center',
                    boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.6)',
                    minWidth: '160px'
                  }}>
                    <div style={{
                      fontSize: '3rem',
                      fontWeight: '900',
                      color: '#fff',
                      lineHeight: '1',
                      marginBottom: '0.5rem'
                    }}>
                      {application.match_score || 'N/A'}%
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px'
                    }}>
                      {getScoreBadge(application.match_score)}
                    </div>
                  </div>
                </div>

                {/* ML Breakdown */}
                {application.match_score && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                    padding: '2rem',
                    borderRadius: '20px',
                    marginTop: '2rem',
                    border: '1px solid rgba(99, 102, 241, 0.15)'
                  }}>
                    <h4 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#fff',
                      margin: '0 0 1.5rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      letterSpacing: '-0.01em'
                    }}>
                      🤖 AI Match Analysis
                    </h4>

                    {/* Score Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s ease'
                      }}>
                        <strong style={{
                          display: 'block',
                          color: '#a1a1aa',
                          fontSize: '0.8rem',
                          marginBottom: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: '600'
                        }}>
                          Skill Match
                        </strong>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '800',
                          color: '#fff',
                          letterSpacing: '-0.02em'
                        }}>
                          {application.skill_match_score || 0}%
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s ease'
                      }}>
                        <strong style={{
                          display: 'block',
                          color: '#a1a1aa',
                          fontSize: '0.8rem',
                          marginBottom: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: '600'
                        }}>
                          Experience Fit
                        </strong>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '800',
                          color: '#fff',
                          letterSpacing: '-0.02em'
                        }}>
                          {application.experience_fit_score || 0}%
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s ease'
                      }}>
                        <strong style={{
                          display: 'block',
                          color: '#a1a1aa',
                          fontSize: '0.8rem',
                          marginBottom: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: '600'
                        }}>
                          Portfolio Quality
                        </strong>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '800',
                          color: '#fff',
                          letterSpacing: '-0.02em'
                        }}>
                          {application.portfolio_quality_score || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Matching Skills */}
                    {application.matching_skills && application.matching_skills.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <strong style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          marginBottom: '1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: '700',
                          color: '#10b981'
                        }}>
                          ✓ Matching Skills
                        </strong>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}>
                          {application.matching_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '0.625rem 1.25rem',
                                borderRadius: '100px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 15px -3px rgba(16, 185, 129, 0.4)',
                                letterSpacing: '0.3px'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {application.missing_skills && application.missing_skills.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <strong style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          marginBottom: '1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: '700',
                          color: '#ef4444'
                        }}>
                          ✗ Missing Skills
                        </strong>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}>
                          {application.missing_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '0.625rem 1.25rem',
                                borderRadius: '100px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 15px -3px rgba(239, 68, 68, 0.4)',
                                letterSpacing: '0.3px'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Reasoning */}
                    {application.ai_reasoning && (
                      <div style={{
                        marginTop: '1.5rem',
                        padding: '1.25rem',
                        background: 'rgba(99, 102, 241, 0.08)',
                        borderLeft: '3px solid #6366f1',
                        borderRadius: '12px'
                      }}>
                        <strong style={{
                          color: '#a78bfa',
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: '700'
                        }}>
                          AI Analysis
                        </strong>
                        <p style={{
                          color: '#d4d4d8',
                          fontStyle: 'italic',
                          margin: '0.75rem 0 0 0',
                          lineHeight: '1.7',
                          fontSize: '0.95rem'
                        }}>
                          {application.ai_reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Developer Stats */}
                {application.developer_stats && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '1rem',
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <strong style={{
                        display: 'block',
                        color: '#a1a1aa',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Rating
                      </strong>
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#fff',
                        margin: '0',
                        letterSpacing: '-0.01em'
                      }}>
                        ⭐ {application.developer_stats.rating.toFixed(1)}/5.0
                      </p>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <strong style={{
                        display: 'block',
                        color: '#a1a1aa',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Experience
                      </strong>
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#fff',
                        margin: '0',
                        letterSpacing: '-0.01em'
                      }}>
                        {application.developer_stats.years_experience} years
                      </p>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <strong style={{
                        display: 'block',
                        color: '#a1a1aa',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Projects
                      </strong>
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#fff',
                        margin: '0',
                        letterSpacing: '-0.01em'
                      }}>
                        {application.developer_stats.total_projects}
                      </p>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <strong style={{
                        display: 'block',
                        color: '#a1a1aa',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Success Rate
                      </strong>
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#fff',
                        margin: '0',
                        letterSpacing: '-0.01em'
                      }}>
                        {application.developer_stats.success_rate.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Application Details */}
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <p style={{
                    color: '#d4d4d8',
                    margin: '1rem 0',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <strong style={{ color: '#fff', fontWeight: '600' }}>Proposed Budget:</strong>
                    ${application.proposed_rate || 'Not specified'}
                  </p>
                  <p style={{
                    color: '#d4d4d8',
                    margin: '1rem 0',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <strong style={{ color: '#fff', fontWeight: '600' }}>Timeline:</strong>
                    {application.estimated_duration}
                  </p>
                  <p style={{
                    color: '#d4d4d8',
                    margin: '1rem 0',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <strong style={{ color: '#fff', fontWeight: '600' }}>Status:</strong>
                    <span style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      background: application.status === 'pending' 
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 15px -3px rgba(245, 158, 11, 0.4)'
                    }}>
                      {application.status}
                    </span>
                  </p>
                  <p style={{
                    color: '#d4d4d8',
                    margin: '1rem 0',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <strong style={{ color: '#fff', fontWeight: '600' }}>Applied:</strong>
                    {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Cover Letter */}
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#fff',
                    margin: '0 0 1rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Cover Letter
                  </h4>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '1.75rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#d4d4d8',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.95rem'
                  }}>
                    {application.cover_letter}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  marginTop: '2rem',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => handleAssignProject(application.id)}
                    disabled={application.status !== 'pending'}
                    style={{
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: '#fff',
                      boxShadow: '0 8px 25px -5px rgba(99, 102, 241, 0.5)',
                      transition: 'all 0.2s ease',
                      opacity: application.status !== 'pending' ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (application.status === 'pending') {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 12px 35px -5px rgba(99, 102, 241, 0.6)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 8px 25px -5px rgba(99, 102, 241, 0.5)'
                    }}
                  >
                    {application.status === 'pending' ? 'Assign Project' : 'Already Assigned'}
                  </button>

                  <button
                    onClick={() => handleViewProfile(application.developer_email)}
                    style={{
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.12)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              maxWidth: '600px',
              margin: '6rem auto',
              textAlign: 'center',
              padding: '4rem 3rem',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <p style={{
                fontSize: '1.25rem',
                color: '#a1a1aa',
                margin: '0',
                fontWeight: '500'
              }}>
                No applications yet for this project.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationsView
