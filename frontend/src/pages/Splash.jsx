import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Splash = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them to dashboard after a brief delay
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between p-4" style={{ background: 'radial-gradient(circle at 50% 50%, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      <header className="container d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="material-icons-round text-primary-emphasis fs-2" style={{ color: '#6366f1' }}>mic</i>
          <span className="h4 mb-0 display-font fw-bold text-gradient">Voice Notes</span>
        </div>
        <div>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-outline-primary rounded-pill px-4" style={{ borderColor: '#6366f1', color: '#6366f1' }}>
              Dashboard
            </Link>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-link text-decoration-none text-secondary">Sign In</Link>
              <Link to="/register" className="btn rounded-pill px-4 text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </header>

      <main className="container my-auto py-5">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-5 mb-lg-0 text-center text-lg-start">
            <span className="badge rounded-pill mb-3 px-3 py-2 text-white" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <span style={{ color: '#6366f1', fontWeight: 'bold' }}>New:</span> Multi-language Speech API
            </span>
            <h1 className="display-4 fw-extrabold display-font mb-4 leading-tight">
              Capture Your Thoughts <br />
              <span className="text-gradient">With Your Voice</span>
            </h1>
            <p className="lead text-secondary mb-5" style={{ fontSize: '1.15rem' }}>
              Create rich, searchable notes by speaking. Support for English, Hindi, and Telugu transcribing, plus instant text translations. Organize, pin, favorite, and archive effortlessly.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              {isAuthenticated ? (
                <button onClick={() => navigate('/dashboard')} className="btn btn-lg rounded-pill px-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/register')} className="btn btn-lg rounded-pill px-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                    Get Started Free
                  </button>
                  <button onClick={() => navigate('/login')} className="btn btn-lg btn-outline-secondary rounded-pill px-4">
                    Explore API
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="col-lg-6 d-flex justify-content-center">
            <div className="position-relative" style={{ maxWidth: '480px', width: '100%' }}>
              {/* Premium Glow effect */}
              <div 
                className="position-absolute rounded-circle opacity-20 blur-30" 
                style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, #6366f1, #a855f7)', filter: 'blur(80px)', top: '-50px', right: '-50px', zIndex: 0 }}
              />
              <div className="card border-0 rounded-4 shadow-lg p-4 position-relative" style={{ zIndex: 1, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="pulse-circle" />
                    <span className="text-secondary fw-semibold">Recording...</span>
                  </div>
                  <span className="text-muted small">0:12</span>
                </div>
                
                <blockquote className="blockquote mb-4 text-start">
                  <p className="mb-0 text-gradient fs-5 fw-medium">
                    "ప్రాజెక్ట్ డిజైన్ ప్లాన్ సిద్ధం చేయండి మరియు రికార్డింగ్ ప్రారంభించండి"
                  </p>
                </blockquote>
                
                <div className="border-top border-light-subtle pt-3 text-start">
                  <div className="small text-muted mb-1">English Translation:</div>
                  <p className="mb-0 text-secondary italic">
                    "Prepare project design plan and start recording"
                  </p>
                </div>
                
                <div className="d-flex justify-content-around mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn rounded-circle bg-light btn-icon text-secondary">
                    <i className="material-icons-round">language</i>
                  </button>
                  <button className="btn rounded-circle text-white d-flex align-items-center justify-content-center shadow-lg" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)' }}>
                    <i className="material-icons-round">stop</i>
                  </button>
                  <button className="btn rounded-circle bg-light btn-icon text-secondary">
                    <i className="material-icons-round">edit</i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container text-center text-muted py-4 border-top border-light-subtle" style={{ fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} Voice Notes System. Built for modern, high-fidelity productivity.
      </footer>
    </div>
  );
};

export default Splash;
