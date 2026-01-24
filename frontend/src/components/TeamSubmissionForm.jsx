import { useState } from 'react'
import './TeamSubmissionForm.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const TeamSubmissionForm = ({ assignmentId, submissionType, onSuccess }) => {
  // Figma submission
  const [figmaUrl, setFigmaUrl] = useState('')
  const [figmaImages, setFigmaImages] = useState([])
  
  // Project submission
  const [githubUrl, setGithubUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [documentationUrl, setDocumentationUrl] = useState('')
  const [zipFile, setZipFile] = useState(null)
  const [pdfFiles, setPdfFiles] = useState([])
  const [description, setDescription] = useState('')
  
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setFigmaImages(prev => [...prev, ...files])
  }

  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files)
    setPdfFiles(prev => [...prev, ...files])
  }

  const handleZipUpload = (e) => {
    setZipFile(e.target.files[0])
  }

  const removeImage = (index) => {
    setFigmaImages(prev => prev.filter((_, i) => i !== index))
  }

  const removePdf = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ml_default') // You'll need to set this up in Cloudinary
    
    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload',
        {
          method: 'POST',
          body: formData
        }
      )
      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error('Upload failed:', error)
      return null
    }
  }

  const submitFigma = async () => {
    if (!figmaUrl && figmaImages.length === 0) {
      alert('Please provide either a Figma URL or upload images')
      return
    }

    setUploading(true)
    try {
      // Upload images to Cloudinary
      const imageUrls = []
      for (const image of figmaImages) {
        const url = await uploadToCloudinary(image)
        if (url) imageUrls.push(url)
      }

      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${assignmentId}/submit_figma/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            figma_url: figmaUrl,
            image_urls: imageUrls
          })
        }
      )

      if (response.ok) {
        alert('Figma submitted successfully!')
        onSuccess()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to submit Figma:', error)
      alert('Failed to submit Figma')
    } finally {
      setUploading(false)
    }
  }

  const submitProject = async () => {
    if (!githubUrl && !zipFile && pdfFiles.length === 0) {
      alert('Please provide at least GitHub URL, ZIP file, or PDF documents')
      return
    }

    setUploading(true)
    try {
      // Upload ZIP file
      let zipUrl = null
      if (zipFile) {
        zipUrl = await uploadToCloudinary(zipFile)
      }

      // Upload PDF files
      const pdfUrls = []
      for (const pdf of pdfFiles) {
        const url = await uploadToCloudinary(pdf)
        if (url) pdfUrls.push(url)
      }

      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${assignmentId}/submit_project/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            submission_links: {
              github: githubUrl,
              live: liveUrl,
              documentation: documentationUrl,
              zip_file: zipUrl,
              pdf_files: pdfUrls,
              description: description
            }
          })
        }
      )

      if (response.ok) {
        alert('Project submitted successfully!')
        onSuccess()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to submit project:', error)
      alert('Failed to submit project')
    } finally {
      setUploading(false)
    }
  }

  if (submissionType === 'figma') {
    return (
      <div className="submission-form">
        <h3>📐 Figma Design Submission</h3>
        
        <div className="form-group">
          <label>Figma URL</label>
          <input
            type="url"
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="https://figma.com/..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Or Upload Design Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="form-input"
          />
          {figmaImages.length > 0 && (
            <div className="file-list">
              {figmaImages.map((file, index) => (
                <div key={index} className="file-item">
                  <span>🖼️ {file.name}</span>
                  <button onClick={() => removeImage(index)} className="remove-btn">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={submitFigma} 
          disabled={uploading}
          className="submit-btn"
        >
          {uploading ? 'Uploading...' : 'Submit Figma Design'}
        </button>
      </div>
    )
  }

  return (
    <div className="submission-form">
      <h3>🚀 Final Project Submission</h3>
      
      <div className="form-group">
        <label>GitHub Repository URL</label>
        <input
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/..."
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Live Project URL</label>
        <input
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          placeholder="https://yourproject.com"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Documentation URL</label>
        <input
          type="url"
          value={documentationUrl}
          onChange={(e) => setDocumentationUrl(e.target.value)}
          placeholder="https://docs.yourproject.com"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Upload ZIP File (Source Code)</label>
        <input
          type="file"
          accept=".zip"
          onChange={handleZipUpload}
          className="form-input"
        />
        {zipFile && (
          <div className="file-item">
            <span>📦 {zipFile.name}</span>
            <button onClick={() => setZipFile(null)} className="remove-btn">×</button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Upload PDF Documents</label>
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handlePdfUpload}
          className="form-input"
        />
        {pdfFiles.length > 0 && (
          <div className="file-list">
            {pdfFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span>📄 {file.name}</span>
                <button onClick={() => removePdf(index)} className="remove-btn">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Project Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project, features implemented, technologies used..."
          className="form-textarea"
          rows="5"
        />
      </div>

      <button 
        onClick={submitProject} 
        disabled={uploading}
        className="submit-btn"
      >
        {uploading ? 'Uploading...' : 'Submit Final Project'}
      </button>
    </div>
  )
}

export default TeamSubmissionForm
