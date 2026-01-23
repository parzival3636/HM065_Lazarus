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
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
      <h1>Earnings Overview</h1>

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

      <div className="earnings-content">
        <section>
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div>
                  <h4>{transaction.project}</h4>
                  <p>{transaction.date}</p>
                </div>
                <div className="transaction-amount">
                  <span className="amount">${transaction.amount}</span>
                  <span className={`status ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Payment Methods</h2>
          <div className="payment-methods">
            <div className="payment-method">
              <h4>PayPal</h4>
              <p>user@example.com</p>
              <button className="btn btn-secondary">Update</button>
            </div>
            <div className="payment-method">
              <h4>Bank Account</h4>
              <p>****1234</p>
              <button className="btn btn-secondary">Update</button>
            </div>
          </div>
        </section>
      </div>

      <Link to="/dashboard/developer" className="back-link">← Back to Dashboard</Link>
      </div>
    </div>
  )
}

export default Earnings