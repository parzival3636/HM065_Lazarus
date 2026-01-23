import { useState, useEffect } from 'react'
import { getUserProfile } from '../services/api'
import Navbar from './Navbar'
import './Dashboard.css'

const PaymentHistory = () => {
  const [user, setUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({
    totalSpent: 0,
    thisMonth: 0,
    pendingPayments: 0,
    completedProjects: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getUserProfile()
        if (result.user) {
          setUser(result.user)
        }
        
        // Mock payment data
        setStats({
          totalSpent: 15000,
          thisMonth: 3500,
          pendingPayments: 800,
          completedProjects: 12
        })

        setPayments([
          {
            id: 1,
            project: 'E-commerce Website',
            developer: 'John Doe',
            amount: 3000,
            date: '2024-01-15',
            status: 'completed'
          },
          {
            id: 2,
            project: 'Mobile App Design',
            developer: 'Jane Smith',
            amount: 2000,
            date: '2024-01-10',
            status: 'pending'
          }
        ])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <div>Please login to continue</div>

  return (
    <div>
      <Navbar user={user} />
      <div className="dashboard-container">
        <h1>Payment History</h1>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Spent</h3>
            <span className="stat-number">${stats.totalSpent}</span>
          </div>
          <div className="stat-card">
            <h3>This Month</h3>
            <span className="stat-number">${stats.thisMonth}</span>
          </div>
          <div className="stat-card">
            <h3>Pending Payments</h3>
            <span className="stat-number">${stats.pendingPayments}</span>
          </div>
          <div className="stat-card">
            <h3>Completed Projects</h3>
            <span className="stat-number">{stats.completedProjects}</span>
          </div>
        </div>

        <div className="earnings-content">
          <section>
            <h2>Recent Payments</h2>
            <div className="transactions-list">
              {payments.map(payment => (
                <div key={payment.id} className="transaction-item">
                  <div>
                    <h4>{payment.project}</h4>
                    <p>Developer: {payment.developer}</p>
                    <p>{payment.date}</p>
                  </div>
                  <div className="transaction-amount">
                    <span className="amount">${payment.amount}</span>
                    <span className={`status ${payment.status}`}>
                      {payment.status}
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
                <h4>Credit Card</h4>
                <p>****1234</p>
                <button className="btn btn-secondary">Update</button>
              </div>
              <div className="payment-method">
                <h4>PayPal</h4>
                <p>company@example.com</p>
                <button className="btn btn-secondary">Update</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PaymentHistory