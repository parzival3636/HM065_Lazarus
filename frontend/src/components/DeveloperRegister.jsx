import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerDeveloper } from '../services/api'
import './Auth.css'

const DeveloperRegister = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    city: '',
    title: '',
    bio: '',
    hourlyRate: '',
    skills: '',
    experience: '',
    yearsExperience: '',
    portfolio: '',
    github: '',
    dribbble: '',
    behance: '',
    linkedin: '',
    education: '',
    languages: '',
    availability: 'full-time'
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
      const result = await registerDeveloper(formData)
      
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Registration successful! Redirecting to dashboard...')
        // Store session token only
        if (result.session) {
          localStorage.setItem('session', JSON.stringify(result.session))
        }
        setTimeout(() => {
          navigate('/dashboard/developer')
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
    <div className="auth-container register-developer">
      <div className="auth-form">
        <h2>Join as Developer/Designer</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <input
              type="email"
              name="email"
              placeholder="Email Address"
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
                placeholder="Phone Number"
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
            <h3>Professional Details</h3>
            <input
              type="text"
              name="title"
              placeholder="Professional Title (e.g., Full Stack Developer)"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <textarea
              name="bio"
              placeholder="Professional Bio (Tell clients about yourself)"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
            />
            
            <div className="form-row">
              <input
                type="number"
                name="hourlyRate"
                placeholder="Hourly Rate ($)"
                value={formData.hourlyRate}
                onChange={handleChange}
              />
              <input
                type="number"
                name="yearsExperience"
                placeholder="Years of Experience"
                value={formData.yearsExperience}
                onChange={handleChange}
                required
              />
            </div>
            
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            >
              <option value="">Experience Level</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
            
            <textarea
              name="skills"
              placeholder="Skills (e.g., React, Node.js, Python, UI/UX Design)"
              value={formData.skills}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-section">
            <h3>Portfolio & Social Links</h3>
            <div className="form-row">
              <input
                type="url"
                name="portfolio"
                placeholder="Portfolio Website"
                value={formData.portfolio}
                onChange={handleChange}
              />
              <input
                type="url"
                name="github"
                placeholder="GitHub Profile"
                value={formData.github}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-row">
              <input
                type="url"
                name="dribbble"
                placeholder="Dribbble Profile"
                value={formData.dribbble}
                onChange={handleChange}
              />
              <input
                type="url"
                name="behance"
                placeholder="Behance Profile"
                value={formData.behance}
                onChange={handleChange}
              />
            </div>
            
            <input
              type="url"
              name="linkedin"
              placeholder="LinkedIn Profile"
              value={formData.linkedin}
              onChange={handleChange}
            />
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <input
              type="text"
              name="education"
              placeholder="Education (e.g., BS Computer Science)"
              value={formData.education}
              onChange={handleChange}
            />
            
            <div className="form-row">
              <input
                type="text"
                name="languages"
                placeholder="Languages (e.g., English, Spanish)"
                value={formData.languages}
                onChange={handleChange}
              />
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract Only</option>
              </select>
            </div>
          </div>
          
          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Developer Account'}
          </button>
        </form>
        
        <p>Already have an account? <Link to="/login">Login</Link></p>
        <p>Want to hire developers? <Link to="/register/company">Register as Company</Link></p>
        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  )
}

export default DeveloperRegister