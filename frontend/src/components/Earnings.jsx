import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const Earnings = () => {
  const [user, setUser] = useState(null)
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pendingPayments: 0,
    completedProjects: 0
  })

  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const result = await getUserProfile()
        if (result.user) {
          setUser(result.user)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetchUserProfile()

    // Mock data
    setEarnings({
      totalEarnings: 12500,
      thisMonth: 2800,
      pendingPayments: 1200,
      completedProjects: 8
    })

    setTransactions([
      {
        id: 1,
        project: 'E-commerce Website',
        amount: 2500,
        date: '2024-01-15',
        status: 'completed'
      },
      {
        id: 2,
        project: 'Mobile App Design',
        amount: 1800,
        date: '2024-01-10',
        status: 'pending'
      }
    ])
  }, [])

  return (
    <div className="dashboard-container">
      <Navbar user={user} />
      <div className="dashboard-wrapper">
        <h1 style={{color: '#374151', marginBottom: '2rem'}}>Earnings Overview</h1>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Earnings</h3>
            <span className="stat-number">${earnings.totalEarnings}</span>
          </div>
          <div className="stat-card">
            <h3>This Month</h3>
            <span className="stat-number">${earnings.thisMonth}</span>
          </div>
          <div className="stat-card">
            <h3>Pending Payments</h3>
            <span className="stat-number">${earnings.pendingPayments}</span>
          </div>
          <div className="stat-card">
            <h3>Completed Projects</h3>
            <span className="stat-number">{earnings.completedProjects}</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <section style={{
            background: '#ffffff',
            border: '1px solid rgba(102, 126, 234, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)'
          }}>
            <h2 style={{color: '#374151', marginBottom: '1.5rem'}}>Recent Transactions</h2>
            <div className="transactions-list">
              {transactions.map(transaction => (
                <div key={transaction.id} style={{
                  background: '#fafbff',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{color: '#374151', marginBottom: '0.5rem'}}>{transaction.project}</h4>
                    <p style={{color: '#6b7280', fontSize: '0.9rem'}}>{transaction.date}</p>
                  </div>
                  <div className="transaction-amount">
                    <span style={{color: '#374151', fontWeight: '700', fontSize: '1.1rem'}}>${transaction.amount}</span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginLeft: '1rem',
                      backgroundColor: transaction.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: transaction.status === 'completed' ? '#059669' : '#d97706'
                    }}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{
            background: '#ffffff',
            border: '1px solid rgba(102, 126, 234, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)'
          }}>
            <h2 style={{color: '#374151', marginBottom: '1.5rem'}}>Payment Methods</h2>
            <div className="payment-methods">
              <div style={{
                background: '#f8faff',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{color: '#374151', marginBottom: '0.5rem'}}>PayPal</h4>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>user@example.com</p>
                <button className="btn btn-secondary">Update</button>
              </div>
              <div style={{
                background: '#f8faff',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{color: '#374151', marginBottom: '0.5rem'}}>Bank Account</h4>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>****1234</p>
                <button className="btn btn-secondary">Update</button>
              </div>
            </div>
          </section>
        </div>

        <Link to="/dashboard/developer" style={{
          color: '#667eea',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '2rem'
        }}>← Back to Dashboard</Link>
      </div>
    </div>
  )
}

export default Earnings