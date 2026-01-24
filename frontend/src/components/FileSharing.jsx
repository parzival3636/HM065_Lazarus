import { useState, useEffect, useCallback } from 'react'
import './FileSharing.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const FileSharing = ({ assignmentId, onFileShared }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [sharedLinks, setSharedLinks] = useState([])
  const [newLink, setNewLink] = useState('')
  const [linkDescription, setLinkDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSharedItems = useCallback(async () => {
    if (!assignmentId) {
      setLoading(false)
      return
    }
    
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      
      if (!session.access_token) {
        console.warn('No access token found')
        setLoading(false)
        return
      }
      
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${assignmentId}/get_shared_files/`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched shared items:', data)
        setUploadedFiles(Array.isArray(data.files) ? data.files : [])
        setSharedLinks(Array.isArray(data.links) ? data.links : [])
      } else {
        console.warn('Failed to fetch shared items, status:', response.status)
        setUploadedFiles([])
        setSharedLinks([])
      }
    } catch (error) {
      console.error('Failed to fetch shared items:', error)
      setUploadedFiles([])
      setSharedLinks([])
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  // Fetch shared files and links on mount
  useEffect(() => {
    if (assignmentId) {
      fetchSharedItems()
    }
  }, [assignmentId, fetchSharedItems])

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      
      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, create temporary URLs
      for (const file of files) {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file) // In production, this would be the cloud storage URL
        }

        try {
          const response = await fetch(
            `${API_BASE_URL}/projects/team-assignments/${assignmentId}/share_file/`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(fileData)
            }
          )

          if (!response.ok) {
            console.error('Failed to share file:', file.name)
          }
        } catch (err) {
          console.error('Error sharing file:', file.name, err)
        }
      }

      // Refresh the list
      await fetchSharedItems()
      
      // Notify parent component
      if (onFileShared) {
        onFileShared({ type: 'files', count: files.length })
      }

      alert(`${files.length} file(s) uploaded successfully!\n\nNote: In production, these would be uploaded to cloud storage.`)
    } catch (error) {
      console.error('Failed to upload files:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleAddLink = async () => {
    if (!newLink.trim()) {
      alert('Please enter a link')
      return
    }

    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${assignmentId}/share_link/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: newLink,
            description: linkDescription || newLink
          })
        }
      )

      if (response.ok) {
        setNewLink('')
        setLinkDescription('')
        await fetchSharedItems()
        
        // Notify parent component
        if (onFileShared) {
          onFileShared({ type: 'link' })
        }
      } else {
        alert('Failed to share link')
      }
    } catch (error) {
      console.error('Failed to share link:', error)
      alert('Failed to share link')
    }
  }

  const removeFile = async (fileId) => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${assignmentId}/delete_shared_item/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item_id: fileId,
            item_type: 'file'
          })
        }
      )

      if (response.ok) {
        await fetchSharedItems()
      }
    } catch (error) {
      console.error('Failed to remove file:', error)
    }
  }

  const removeLink = async (linkId) => {
    try {
      const session = JSON.parse(localStorage.getItem('session') || '{}')
      const response = await fetch(
        `${API_BASE_URL}/projects/team-assignments/${assignmentId}/delete_shared_item/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item_id: linkId,
            item_type: 'link'
          })
        }
      )

      if (response.ok) {
        await fetchSharedItems()
      }
    } catch (error) {
      console.error('Failed to remove link:', error)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (!type) return '📎'
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('zip') || type.includes('compressed')) return '📦'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    return '📎'
  }

  if (loading) {
    return (
      <div className="file-sharing-container">
        <h3 className="file-sharing-title">📤 File Sharing</h3>
        <div className="empty-state">
          <p>Loading shared files...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="file-sharing-container">
        <h3 className="file-sharing-title">📤 File Sharing</h3>
        <div className="empty-state">
          <p style={{color: '#ef4444'}}>Error: {error}</p>
          <button 
            onClick={() => {
              setError(null)
              setLoading(true)
              fetchSharedItems()
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="file-sharing-container">
      <h3 className="file-sharing-title">📤 File Sharing</h3>
      
      {/* File Upload Section */}
      <div className="upload-section">
        <label className="upload-label">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept="image/*,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <div className="upload-button">
            {uploading ? (
              <>
                <span className="upload-spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                📁 Choose Files
              </>
            )}
          </div>
        </label>
        <p className="upload-hint">
          Supported: Images, PDFs, ZIP, Documents
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="files-list">
          <h4>Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map(file => (
            <div key={file.id} className="file-item">
              <div className="file-icon">{getFileIcon(file.file_type)}</div>
              <div className="file-info">
                <div className="file-name">{file.file_name || 'Unnamed file'}</div>
                <div className="file-meta">{formatFileSize(file.file_size)}</div>
              </div>
              <div className="file-actions">
                <a 
                  href={file.file_url} 
                  download={file.file_name}
                  className="file-action-btn download"
                  title="Download"
                >
                  ⬇️
                </a>
                <button
                  onClick={() => removeFile(file.id)}
                  className="file-action-btn remove"
                  title="Remove"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link Sharing Section */}
      <div className="link-section">
        <h4>🔗 Share Links</h4>
        <input
          type="url"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          placeholder="https://github.com/username/repo"
          className="link-input"
        />
        <input
          type="text"
          value={linkDescription}
          onChange={(e) => setLinkDescription(e.target.value)}
          placeholder="Description (optional)"
          className="link-input"
        />
        <button
          onClick={handleAddLink}
          className="add-link-button"
          disabled={!newLink.trim()}
        >
          Add Link
        </button>
      </div>

      {/* Shared Links List */}
      {sharedLinks.length > 0 && (
        <div className="links-list">
          <h4>Shared Links ({sharedLinks.length})</h4>
          {sharedLinks.map(link => (
            <div key={link.id} className="link-item">
              <div className="link-icon">🔗</div>
              <div className="link-info">
                <a 
                  href={link.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link-url"
                >
                  {link.link_description || link.link_url}
                </a>
                <div className="link-meta">{link.link_url}</div>
              </div>
              <button
                onClick={() => removeLink(link.id)}
                className="file-action-btn remove"
                title="Remove"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length === 0 && sharedLinks.length === 0 && (
        <div className="empty-state">
          <p>No files or links shared yet</p>
          <p className="empty-hint">Upload files or share links to collaborate with your team</p>
        </div>
      )}

      <div className="production-note">
        💡 <strong>Note:</strong> In production, files will be uploaded to cloud storage (AWS S3, Cloudinary, etc.) and accessible to all team members.
      </div>
    </div>
  )
}

export default FileSharing
