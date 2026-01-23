import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'developer'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const result = await login(formData)
      
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Login successful! Redirecting...')
        // Store session token only
        localStorage.setItem('session', JSON.stringify(result.session))
        setTimeout(() => {
          navigate(`/dashboard/${formData.userType}`)
        }, 1500)
      }
    } catch (error) {
      setMessage('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  return (
    <div className="auth-container login">
      <div className="auth-form">
        <h2>Login to Your Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="user-type-selector">
            <label>
              <input
                type="radio"
                name="userType"
                value="developer"
                checked={formData.userType === 'developer'}
                onChange={handleChange}
              />
              Developer
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="company"
                checked={formData.userType === 'company'}
                onChange={handleChange}
              />
              Company
            </label>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p>Don't have an account? 
          <Link to="/register/developer"> Register as Developer</Link> or 
          <Link to="/register/company"> Register as Company</Link>
        </p>
        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  )
}

export default Login