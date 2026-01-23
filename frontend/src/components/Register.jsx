import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Auth.css'

const Register = () => {
  const [searchParams] = useSearchParams()
  const [userType, setUserType] = useState(searchParams.get('type') || 'developer')
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    city: '',
    
    // Developer/Designer specific
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
    availability: 'full-time',
    
    // Company specific
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    description: '',
    foundedYear: '',
    companyType: 'startup'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Register:', { ...formData, userType })
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  return (
    <div className={`auth-container ${userType === 'developer' ? 'register-developer' : 'register-company'}`}>
      <div className="auth-form">
        <h2>Join DevConnect</h2>
        
        <div className="user-type-selector">
          <button 
            className={userType === 'developer' ? 'active' : ''}
            onClick={() => setUserType('developer')}
          >
            Developer/Designer
          </button>
          <button 
            className={userType === 'company' ? 'active' : ''}
            onClick={() => setUserType('company')}
          >
            Company
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            {userType === 'developer' ? (
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
            ) : (
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            )}
            
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

          {userType === 'developer' && (
            <>
              {/* Professional Information */}
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

              {/* Portfolio & Links */}
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

              {/* Additional Info */}
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
            </>
          )}

          {userType === 'company' && (
            <>
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
                    placeholder="Industry"
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
                  placeholder="Company Description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>
            </>
          )}
          
          <button type="submit" className="btn btn-primary">Create Account</button>
        </form>
        
        <p>Already have an account? <Link to="/login">Login</Link></p>
        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  )
}

export default Register