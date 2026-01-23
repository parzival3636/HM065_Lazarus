import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const ProjectChatInterface = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchAssignment()
    const interval = setInterval(fetchAssignment, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [assignmentId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchAssignment = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/${assignmentId}/chat/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        
        // Fetch full assignment data
        const assignmentResponse = await fetch(
          `${API_BASE_URL}/projects/assignments/${assignmentId}/`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            }
          }
        )
        if (assignmentResponse.ok) {
          setAssignment(await assignmentResponse.json())
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setSending(true)
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/assignments/${assignmentId}/send_message/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            attachments: []
          })
        }
      )

      if (response.ok) {
        setMessageText('')
        await fetchAssignment()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        Loading chat...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff',
            margin: 0
          }}>
            {assignment?.project_title}
          </h1>
          <p style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Chat with {assignment?.developer_name}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#a1a1aa'
          }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.sender_type === 'developer' ? 'flex-start' : 'flex-end',
                marginBottom: '0.5rem'
              }}
            >
              <div style={{
                maxWidth: '70%',
                background: msg.message_type === 'system'
                  ? 'rgba(99, 102, 241, 0.1)'
                  : msg.sender_type === 'developer'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: msg.message_type === 'system'
                  ? '1px solid rgba(99, 102, 241, 0.3)'
                  : 'none',
                borderRadius: '16px',
                padding: '1rem',
                wordWrap: 'break-word'
              }}>
                {msg.message_type === 'system' && (
                  <div style={{ color: '#a78bfa', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    System
                  </div>
                )}
                <p style={{
                  color: msg.message_type === 'system' ? '#d4d4d8' : '#fff',
                  margin: 0,
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  {msg.message}
                </p>
                <div style={{
                  color: msg.message_type === 'system' ? '#71717a' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem 2rem'
      }}>
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '0.875rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)'
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)'
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>

        {/* Quick Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          {!assignment?.figma_submitted && (
            <button
              onClick={() => navigate(`/assignment/${assignmentId}/figma`)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                color: '#a78bfa',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📐 Submit Figma Designs
            </button>
          )}
          {!assignment?.project_submitted && assignment?.figma_submitted && (
            <button
              onClick={() => navigate(`/assignment/${assignmentId}/submit`)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                color: '#a78bfa',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📦 Submit Final Project
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectChatInterface
