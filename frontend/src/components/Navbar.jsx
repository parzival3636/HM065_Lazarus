import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ user }) => {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('session')
    window.location.href = '/login'
  }

  const isCompany = user?.user_type === 'company'

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={isCompany ? "/dashboard/company" : "/dashboard/developer"}>
          <img src="/boast-vertical.png" alt="DevConnect" className="logo" />
        </Link>
      </div>
      
      <div className="navbar-links">
        {isCompany ? (
          <>
            <Link 
              to="/dashboard/company" 
              className={location.pathname === '/dashboard/company' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link 
              to="/dashboard/company/post-project" 
              className={location.pathname === '/dashboard/company/post-project' ? 'active' : ''}
            >
              Post Project
            </Link>
            <Link 
              to="/dashboard/company/my-projects" 
              className={location.pathname === '/dashboard/company/my-projects' ? 'active' : ''}
            >
              My Projects
            </Link>
            <Link 
              to="/dashboard/company/active-projects" 
              className={location.pathname === '/dashboard/company/active-projects' ? 'active' : ''}
            >
              Active Projects
            </Link>
            <Link 
              to="/dashboard/company/find-developers" 
              className={location.pathname === '/dashboard/company/find-developers' ? 'active' : ''}
            >
              Find Developers
            </Link>
            <Link 
              to="/profile" 
              className={location.pathname === '/profile' ? 'active' : ''}
            >
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/dashboard/developer" 
              className={location.pathname === '/dashboard/developer' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link 
              to="/projects" 
              className={location.pathname === '/projects' ? 'active' : ''}
            >
              Projects
            </Link>
            <Link 
              to="/dashboard/developer/portfolio" 
              className={location.pathname === '/dashboard/developer/portfolio' ? 'active' : ''}
            >
              Portfolio
            </Link>
            <Link 
              to="/earnings" 
              className={location.pathname === '/earnings' ? 'active' : ''}
            >
              Earnings
            </Link>
            <Link 
              to="/profile" 
              className={location.pathname === '/profile' ? 'active' : ''}
            >
              Profile
            </Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span>Welcome, {user?.first_name}!</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar