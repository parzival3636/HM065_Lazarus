// import { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import './Home.css'

// const Home = () => {
//   const [currentVideo, setCurrentVideo] = useState(0)
//   const [isLoaded, setIsLoaded] = useState(false)
  
//   const videos = [
//     '3627089-uhd_4096_2160_25fps.mp4',
//     '4443250-hd_1920_1080_25fps.mp4',
//     '4974883-hd_1920_1080_25fps.mp4',
//     '9057576-uhd_3840_2160_25fps.mp4'
//   ]

//   useEffect(() => {
//     setIsLoaded(true)
//     const interval = setInterval(() => {
//       setCurrentVideo((prev) => (prev + 1) % videos.length)
//     }, 10000)
//     return () => clearInterval(interval)
//   }, [videos.length])

//   return (
//     <div className="home">
//       <div className="video-background">
//         {videos.map((video, index) => (
//           <video
//             key={video}
//             className={`background-video ${index === currentVideo ? 'active' : ''}`}
//             autoPlay
//             muted
//             loop
//             playsInline
//           >
//             <source src={`/${video}`} type="video/mp4" />
//           </video>
//         ))}
//         <div className="video-overlay"></div>
//         <div className="floating-elements">
//           <div className="floating-circle"></div>
//           <div className="floating-circle"></div>
//           <div className="floating-circle"></div>
//         </div>
//       </div>

//       <nav className="navbar">
//         <div className="nav-brand">DevConnect</div>
//         <div className="nav-links">
//           <Link to="/projects">Find Projects</Link>
//           <Link to="/login">Login</Link>
//           <Link to="/register/developer">Sign Up</Link>
//         </div>
//       </nav>

//       <div className="hero-content">
//         <h1>Connect. Create. Collaborate.</h1>
//         <p>The ultimate platform where innovative companies meet world-class developers and designers for groundbreaking project collaborations</p>
//         <div className="hero-buttons">
//           <Link to="/register/company" className="btn btn-primary">Post a Project</Link>
//           <Link to="/register/developer" className="btn btn-secondary">Find Work</Link>
//         </div>
//       </div>

//       <div className="features">
//         <div className="feature">
//           <h3>💰 Fair Compensation</h3>
//           <p>Every contributor receives guaranteed participation compensation, ensuring your efforts are always valued</p>
//         </div>
//         <div className="feature">
//           <h3>🔍 Transparent Process</h3>
//           <p>Crystal-clear shortlisting and selection workflow with real-time updates and feedback</p>
//         </div>
//         <div className="feature">
//           <h3>📊 Smart Tracking</h3>
//           <p>Comprehensive dashboard for seamless project management, submissions, and team communication</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Home





import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const videos = [
    '3627089-uhd_4096_2160_25fps.mp4',
    '4443250-hd_1920_1080_25fps.mp4',
    '4974883-hd_1920_1080_25fps.mp4',
    '9057576-uhd_3840_2160_25fps.mp4'
  ]

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [videos.length])

  return (
    <div className="home">
      <div className="video-background">
        {videos.map((video, index) => (
          <video
            key={video}
            className={`background-video ${index === currentVideo ? 'active' : ''}`}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={`/${video}`} type="video/mp4" />
          </video>
        ))}
        <div className="video-overlay"></div>
        <div className="floating-elements">
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
        </div>
      </div>

      <nav className="navbar">
        <div className="nav-brand">DevConnect</div>
        <div className="nav-links">
          <Link to="/projects">Find Projects</Link>
          <Link to="/login">Login</Link>
          <Link to="/register/developer">Sign Up</Link>
        </div>
      </nav>

      <div className="hero-content">
        <h1>Connect. Create. Collaborate.</h1>
        <p>The ultimate platform where innovative companies meet world-class developers and designers for groundbreaking project collaborations</p>
        <div className="hero-buttons">
          <Link to="/register/company" className="btn btn-primary">Post a Project</Link>
          <Link to="/register/developer" className="btn btn-secondary">Find Work</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature">
          <h3>💰 Fair Compensation</h3>
          <p>Every contributor receives guaranteed participation compensation, ensuring your efforts are always valued</p>
        </div>
        <div className="feature">
          <h3>🔍 Transparent Process</h3>
          <p>Crystal-clear shortlisting and selection workflow with real-time updates and feedback</p>
        </div>
        <div className="feature">
          <h3>📊 Smart Tracking</h3>
          <p>Comprehensive dashboard for seamless project management, submissions, and team communication</p>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">DevConnect</div>
            <p className="footer-tagline">
              Connecting talent with opportunity, one project at a time.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Platform</h4>
            <div className="footer-links">
              <Link to="/projects">Browse Projects</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/pricing">Pricing</Link>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <div className="footer-links">
              <Link to="/about">About Us</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/blog">Blog</Link>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <div className="footer-links">
              <Link to="/help">Help Center</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div>© 2026 DevConnect. All rights reserved.</div>
          <div className="footer-social">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home