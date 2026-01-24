import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './DeveloperFigmaSubmissions.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const DeveloperFigmaSubmissions = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [shortlists, setShortlists] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedShortlist, setSelectedShortlist] = useState(null)
  const [figmaUrl, setFigmaUrl] = useState('')
  const [figmaDescription, setFigmaDescription] = useState('')
  const [designImages, setDesignImages] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userResult = await getUserProfile()
      if (userResult.user) {
        setUser(userResult.user)
      }

      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/figma/my-shortlists/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setShortlists(data.shortlists || [])
      }
    } catch (error) {
      console.error('Failed to fetch shortlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!figmaUrl && designImages.length === 0) {
      alert('Please provide either a Figma URL or upload design images')
      return
    }

    if (figmaUrl && !figmaUrl.includes('figma.com')) {
      alert('Please provide a valid Figma URL')
      return
    }

    setSubmitting(true)
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      
      // Upload images first if any
      let imageUrls = []
      if (designImages.length > 0) {
        setUploading(true)
        imageUrls = await uploadImages(designImages, session.access_token)
        setUploading(false)
      }

      const response = await fetch(
        `${API_BASE_URL}/projects/figma/shortlist/${selectedShortlist.shortlist_id}/submit/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            figma_url: figmaUrl || null,
            figma_description: figmaDescription,
            design_images: imageUrls
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.all_submitted) {
          alert('Design submitted successfully!\n\nAll developers have submitted. The company can now review designs and use AI evaluation.')
        } else {
          alert(`Design submitted successfully!\n\nWaiting for ${data.total_count - data.submitted_count} more developer(s) to submit.`)
        }
        setSelectedShortlist(null)
        setFigmaUrl('')
        setFigmaDescription('')
        setDesignImages([])
        fetchData() // Refresh list
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to submit design'}`)
      }
    } catch (error) {
      console.error('Error submitting:', error)
      alert(`Failed to submit design: ${error.message || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const uploadImages = async (images, token) => {
    const uploadedUrls = []
    
    for (const image of images) {
      const formData = new FormData()
      formData.append('file', image)
      formData.append('shortlist_id', selectedShortlist.shortlist_id)
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/projects/figma/upload-image/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.image_url)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to upload image')
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        throw new Error(`Failed to upload ${image.name}: ${error.message}`)
      }
    }
    
    return uploadedUrls
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    const validImages = files.filter(file => file.type.startsWith('image/'))
    
    if (validImages.length !== files.length) {
      alert('Only image files are allowed')
    }
    
    if (designImages.length + validImages.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }
    
    setDesignImages([...designImages, ...validImages])
  }

  const removeImage = (index) => {
    setDesignImages(designImages.filter((_, i) => i !== index))
  }

  const openSubmissionModal = (shortlist) => {
    setSelectedShortlist(shortlist)
    setFigmaUrl('')
    setFigmaDescription('')
    setDesignImages([])
  }

  const closeModal = () => {
    setSelectedShortlist(null)
    setFigmaUrl('')
    setFigmaDescription('')
    setDesignImages([])
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div className="loading">Please login to continue</div>

  const pendingShortlists = shortlists.filter(s => !s.figma_submitted)
  const submittedShortlists = shortlists.filter(s => s.figma_submitted)

  return (
    <>
      <Navbar user={user} />
      <div className="developer-figma-container">
        <div className="figma-header">
          <h1>My Figma Submissions</h1>
          <p>You've been shortlisted for design verification</p>
        </div>

        {/* Pending Submissions */}
        {pendingShortlists.length > 0 && (
          <div className="section">
            <h2 className="section-title pending">⏳ Pending Submissions</h2>
            <div className="shortlist-grid">
              {pendingShortlists.map((shortlist) => (
                <div key={shortlist.shortlist_id} className="shortlist-card pending">
                  <div className="card-badge urgent">Action Required</div>
                  <h3>{shortlist.project_title}</h3>
                  <p className="company-name">{shortlist.company_name}</p>
                  
                  <div className="deadline-section">
                    <strong>Deadline:</strong>
                    <div className="deadline-date">
                      {new Date(shortlist.figma_deadline).toLocaleDateString()}
                    </div>
                    <div className="time-remaining">
                      {getTimeRemaining(shortlist.figma_deadline)}
                    </div>
                  </div>

                  <div className="project-description">
                    <strong>Project Requirements:</strong>
                    <p>{shortlist.project_description.substring(0, 200)}...</p>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => openSubmissionModal(shortlist)}
                  >
                    Submit Figma Design
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submitted Designs */}
        {submittedShortlists.length > 0 && (
          <div className="section">
            <h2 className="section-title submitted">✓ Submitted Designs</h2>
            <div className="shortlist-grid">
              {submittedShortlists.map((shortlist) => (
                <div key={shortlist.shortlist_id} className="shortlist-card submitted">
                  {shortlist.is_winner && (
                    <div className="card-badge winner">🎉 Winner!</div>
                  )}
                  <h3>{shortlist.project_title}</h3>
                  <p className="company-name">{shortlist.company_name}</p>
                  
                  <div className="submission-info">
                    <p><strong>Submitted:</strong> {new Date(shortlist.submitted_at).toLocaleDateString()}</p>
                    {shortlist.figma_url && (
                      <a 
                        href={shortlist.figma_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="figma-link"
                      >
                        View My Design →
                      </a>
                    )}
                    
                    {shortlist.design_images && shortlist.design_images.length > 0 && (
                      <div className="my-design-images">
                        <strong>My Design Images:</strong>
                        <div className="design-images-grid">
                          {shortlist.design_images.map((imageUrl, idx) => (
                            <a 
                              key={idx}
                              href={imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <img src={imageUrl} alt={`My design ${idx + 1}`} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {shortlist.clip_score !== null && (
                    <div className="evaluation-results">
                      <h4>AI Evaluation Results</h4>
                      <div className="score-box">
                        <div className="score">{shortlist.clip_score.toFixed(1)}</div>
                        <div className="label">CLIP Score</div>
                      </div>
                      <div className="rank-box">
                        Rank: #{shortlist.clip_rank}
                      </div>
                    </div>
                  )}

                  {shortlist.is_winner && (
                    <div className="winner-message">
                      <p>🎉 Congratulations! You've been selected for this project!</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {shortlists.length === 0 && (
          <div className="empty-state">
            <p>You haven't been shortlisted for any Figma submissions yet.</p>
            <p>Keep applying to projects to get shortlisted!</p>
          </div>
        )}

        {/* Submission Modal */}
        {selectedShortlist && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Submit Figma Design</h2>
              <h3>{selectedShortlist.project_title}</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Figma URL (Optional)</label>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://www.figma.com/file/..."
                  />
                  <small>Share your Figma file with view access</small>
                </div>

                <div className="form-group">
                  <label>Design Images (Optional - Max 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="upload-button">
                    📷 Choose Images
                  </label>
                  
                  {designImages.length > 0 && (
                    <div className="image-preview-grid">
                      {designImages.map((image, index) => (
                        <div key={index} className="image-preview">
                          <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <small>Upload screenshots or mockups of your design (PNG, JPG, etc.)</small>
                </div>

                <div className="form-group">
                  <label>Design Description (Optional)</label>
                  <textarea
                    value={figmaDescription}
                    onChange={(e) => setFigmaDescription(e.target.value)}
                    placeholder="Briefly describe your design approach..."
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || uploading}
                  >
                    {uploading ? 'Uploading Images...' : submitting ? 'Submitting...' : 'Submit Design'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const getTimeRemaining = (deadline) => {
  const now = new Date()
  const end = new Date(deadline)
  const diff = end - now
  
  if (diff < 0) return 'Deadline passed'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`
  return 'Less than 1 hour remaining'
}

export default DeveloperFigmaSubmissions
