const API_BASE_URL = 'http://127.0.0.1:8000/api'

export const registerDeveloper = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/developer/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  return response.json()
}

export const registerCompany = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/company/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  return response.json()
}

export const login = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  return response.json()
}

export const getUserProfile = async () => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

export const getCompanyProjects = async () => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/company/projects/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

export const createProject = async (formData) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/company/projects/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  return response.json()
}

export const editProject = async (projectId, formData) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/company/projects/${projectId}/edit/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  return response.json()
}

export const getProjectDetails = async (projectId) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/company/projects/${projectId}/edit/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

export const applyToProject = async (projectId, applicationData) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/projects/${projectId}/apply/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData)
  })
  return response.json()
}

export const getProjectApplications = async (projectId) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/company/projects/${projectId}/applications/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

export const getDevelopers = async () => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/developers/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

export const getProjects = async () => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/projects/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

// Portfolio API functions
export const getDeveloperPortfolio = async (developerId) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/portfolio/${developerId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

export const createPortfolioProject = async (projectData) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/portfolio/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData)
  })
  return response.json()
}

export const updatePortfolioProject = async (projectId, projectData) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/portfolio/${projectId}/update/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData)
  })
  return response.json()
}

export const deletePortfolioProject = async (projectId) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/portfolio/${projectId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}

export const incrementPortfolioViews = async (projectId) => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  const response = await fetch(`${API_BASE_URL}/auth/portfolio/${projectId}/views/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  })
  return response.json()
}