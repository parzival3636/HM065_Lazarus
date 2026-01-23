import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerCompany } from '../services/api'
import './Auth.css'

const CompanyRegister = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    city: '',
    companySize: '',
    industry: '',
    website: '',
    description: '',
    foundedYear: '',
    companyType: 'startup'
  })

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) && email.length >= 6
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    if (!validateEmail(formData.email)) {
      setMessage('Please enter a valid email address')
      setLoading(false)
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match')
      setLoading(false)
      return
    }
    
    try {
      const result = await registerCompany(formData)
      
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Registration successful! Redirecting to dashboard...')
        // Store session token only
        if (result.session) {
          localStorage.setItem('session', JSON.stringify(result.session))
        }
        setTimeout(() => {
          navigate('/dashboard/company')
        }, 2000)
      }
    } catch (error) {
      setMessage('Registration failed. Please try again.')
      console.error('Registration failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  return (
    <div className="auth-container register-company">
      <div className="auth-form">
        <h2>Join as Company</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Company Information</h3>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            
            <input
              type="email"
              name="email"
              placeholder="Company Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <div className="form-row">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <input
                type="tel"
                name="phone"
                placeholder="Company Phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Company Details</h3>
            <div className="form-row">
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                required
              >
                <option value="">Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
              >
                <option value="startup">Startup</option>
                <option value="enterprise">Enterprise</option>
                <option value="agency">Agency</option>
                <option value="nonprofit">Non-profit</option>
              </select>
            </div>
            
            <div className="form-row">
              <input
                type="text"
                name="industry"
                placeholder="Industry (e.g., Technology, Healthcare)"
                value={formData.industry}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="foundedYear"
                placeholder="Founded Year"
                value={formData.foundedYear}
                onChange={handleChange}
              />
            </div>
            
            <input
              type="url"
              name="website"
              placeholder="Company Website"
              value={formData.website}
              onChange={handleChange}
            />
            
            <textarea
              name="description"
              placeholder="Company Description (What does your company do?)"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          
          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Company Account'}
          </button>
        </form>
        
        <p>Already have an account? <Link to="/login">Login</Link></p>
        <p>Looking for work? <Link to="/register/developer">Register as Developer</Link></p>
        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  )
}

export default CompanyRegister