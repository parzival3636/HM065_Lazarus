import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [userType] = useState('developer') // This would come from auth context
  
  const mockDeveloperData = {
    name: 'John Developer',
    title: 'Full Stack Developer',
    rating: 4.8,
    totalReviews: 24,
    totalProjects: 15,
    completedProjects: 12,
    successRate: 85.5,
    totalEarnings: 12450.00,
    walletBalance: 2340.50,
    pendingAmount: 850.00,
    isVerified: true,
    skills: ['React', 'Node.js', 'Python', 'UI/UX'],
    portfolio: 'https://johndeveloper.com',
    github: 'https://github.com/johndeveloper'
  }

  const mockCompanyData = {
    companyName: 'TechCorp Inc.',
    industry: 'Technology',
    isVerified: true,
    totalProjectsPosted: 8,
    totalSpent: 25600.00,
    walletBalance: 5000.00,
    averageProjectBudget: 3200.00
  }

  const mockProjects = [
    {
      id: 1,
      title: 'E-commerce Mobile App',
      status: 'In Progress',
      budget: '$800',
      deadline: '2024-02-15',
      client: 'TechCorp Inc.',
      progress: 65
    },
    {
      id: 2,
      title: 'Company Website Redesign',
      status: 'Completed',
      budget: '$1200',
      deadline: '2024-01-20',
      client: 'StartupXYZ',
      progress: 100
    }
  ]

  const mockTransactions = [
    { id: 1, type: 'credit', amount: 800, description: 'Project payment - Mobile App', date: '2024-01-15' },
    { id: 2, type: 'credit', amount: 50, description: 'Participation fee - Website Design', date: '2024-01-10' },
    { id: 3, type: 'debit', amount: 25, description: 'Platform fee', date: '2024-01-08' }
  ]

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}>★</span>
    ))
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">DevConnect</div>
        <div className="nav-links">
          <Link to="/projects">Browse Projects</Link>
          <Link to="/">Logout</Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <div className="avatar-circle">
                {userType === 'developer' ? mockDeveloperData.name.charAt(0) : mockCompanyData.companyName.charAt(0)}
              </div>
              {(userType === 'developer' ? mockDeveloperData.isVerified : mockCompanyData.isVerified) && (
                <div className="verification-badge">✓</div>
              )}
            </div>
            
            {userType === 'developer' ? (
              <>
                <h3>{mockDeveloperData.name}</h3>
                <p>{mockDeveloperData.title}</p>
                <div className="rating-display">
                  {renderStars(mockDeveloperData.rating)}
                  <span className="rating-text">{mockDeveloperData.rating} ({mockDeveloperData.totalReviews} reviews)</span>
                </div>
                <div className="portfolio-links">
                  <a href={mockDeveloperData.portfolio} target="_blank" rel="noopener noreferrer">🌐 Portfolio</a>
                  <a href={mockDeveloperData.github} target="_blank" rel="noopener noreferrer">💻 GitHub</a>
                </div>
              </>
            ) : (
              <>
                <h3>{mockCompanyData.companyName}</h3>
                <p>{mockCompanyData.industry}</p>
              </>
            )}
          </div>
          
          <div className="dashboard-tabs">
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={activeTab === 'projects' ? 'active' : ''}
              onClick={() => setActiveTab('projects')}
            >
              {userType === 'developer' ? 'My Projects' : 'Posted Projects'}
            </button>
            <button 
              className={activeTab === 'wallet' ? 'active' : ''}
              onClick={() => setActiveTab('wallet')}
            >
              💰 Wallet
            </button>
            {userType === 'developer' && (
              <button 
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
            )}
          </div>
        </div>

        <div className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="overview">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                {userType === 'developer' ? (
                  <>
                    <div className="stat-card">
                      <h3>{mockDeveloperData.totalProjects}</h3>
                      <p>Total Projects</p>
                    </div>
                    <div className="stat-card">
                      <h3>{mockDeveloperData.completedProjects}</h3>
                      <p>Completed</p>
                    </div>
                    <div className="stat-card">
                      <h3>${mockDeveloperData.totalEarnings.toLocaleString()}</h3>
                      <p>Total Earnings</p>
                    </div>
                    <div className="stat-card">
                      <h3>{mockDeveloperData.successRate}%</h3>
                      <p>Success Rate</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat-card">
                      <h3>{mockCompanyData.totalProjectsPosted}</h3>
                      <p>Projects Posted</p>
                    </div>
                    <div className="stat-card">
                      <h3>${mockCompanyData.totalSpent.toLocaleString()}</h3>
                      <p>Total Spent</p>
                    </div>
                    <div className="stat-card">
                      <h3>${mockCompanyData.averageProjectBudget.toLocaleString()}</h3>
                      <p>Avg Project Budget</p>
                    </div>
                    <div className="stat-card">
                      <h3>${mockCompanyData.walletBalance.toLocaleString()}</h3>
                      <p>Wallet Balance</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="projects-tab">
              <h2>{userType === 'developer' ? 'My Projects' : 'Posted Projects'}</h2>
              <div className="projects-list">
                {mockProjects.map(project => (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      <h3>{project.title}</h3>
                      <span className={`status ${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="project-meta">
                      <span>Budget: {project.budget}</span>
                      <span>Deadline: {project.deadline}</span>
                      {userType === 'developer' && <span>Client: {project.client}</span>}
                    </div>
                    {project.progress && (
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${project.progress}%`}}></div>
                        <span className="progress-text">{project.progress}% Complete</span>
                      </div>
                    )}
                    <div className="project-actions">
                      <button className="btn btn-primary">View Details</button>
                      <button className="btn btn-secondary">
                        {userType === 'developer' ? 'Submit Work' : 'Manage'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="wallet-tab">
              <h2>Wallet & Earnings</h2>
              <div className="wallet-overview">
                <div className="wallet-card">
                  <h3>Available Balance</h3>
                  <div className="balance-amount">
                    ${userType === 'developer' ? mockDeveloperData.walletBalance : mockCompanyData.walletBalance}
                  </div>
                  <button className="btn btn-primary">Withdraw</button>
                </div>
                
                {userType === 'developer' && (
                  <div className="wallet-card">
                    <h3>Pending Amount</h3>
                    <div className="balance-amount pending">
                      ${mockDeveloperData.pendingAmount}
                    </div>
                    <p>From ongoing projects</p>
                  </div>
                )}
              </div>
              
              <div className="transactions-section">
                <h3>Recent Transactions</h3>
                <div className="transactions-list">
                  {mockTransactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <span className={`transaction-type ${transaction.type}`}>
                          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                        </span>
                        <span className="transaction-desc">{transaction.description}</span>
                      </div>
                      <span className="transaction-date">{transaction.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && userType === 'developer' && (
            <div className="profile-tab">
              <h2>Profile Showcase</h2>
              <div className="profile-showcase">
                <div className="skills-section">
                  <h3>Skills</h3>
                  <div className="skills-tags">
                    {mockDeveloperData.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                
                <div className="stats-section">
                  <h3>Performance Stats</h3>
                  <div className="performance-grid">
                    <div className="perf-item">
                      <span className="perf-label">Success Rate</span>
                      <span className="perf-value">{mockDeveloperData.successRate}%</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">On-time Delivery</span>
                      <span className="perf-value">92%</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">Client Satisfaction</span>
                      <span className="perf-value">{mockDeveloperData.rating}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard