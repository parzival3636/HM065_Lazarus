import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import DeveloperRegister from './components/DeveloperRegister'
import CompanyRegister from './components/CompanyRegister'
import Dashboard from './components/Dashboard'
import DeveloperDashboard from './components/DeveloperDashboard'
import CompanyDashboard from './components/CompanyDashboard'
import Projects from './components/Projects'
import ProjectsList from './components/ProjectsList'
import PostProject from './components/PostProject'
import MyProjects from './components/MyProjects'
import FindDevelopers from './components/FindDevelopers'
import PaymentHistory from './components/PaymentHistory'
import Profile from './components/Profile'
import Portfolio from './components/Portfolio'
import Earnings from './components/Earnings'
import ProjectBrowser from './components/ProjectBrowser'
import ProjectApplications from './components/ProjectApplications'
import DeveloperProfileView from './components/DeveloperProfileView'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/developer" element={<DeveloperRegister />} />
        <Route path="/register/company" element={<CompanyRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/developer" element={<DeveloperDashboard />} />
        <Route path="/dashboard/company" element={<CompanyDashboard />} />
        <Route path="/dashboard/company/post-project" element={<PostProject />} />
        <Route path="/dashboard/company/my-projects" element={<MyProjects />} />
        <Route path="/dashboard/company/projects/:projectId/applications" element={<ProjectApplications />} />
        <Route path="/dashboard/company/find-developers" element={<FindDevelopers />} />
        <Route path="/dashboard/company/payments" element={<PaymentHistory />} />
        <Route path="/post-project" element={<PostProject />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<Profile />} />
        <Route path="/projects" element={<ProjectBrowser />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/dashboard/developer/portfolio" element={<Portfolio />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/developer/:developerId" element={<DeveloperProfileView />} />
      </Routes>
    </Router>
  )
}

export default App