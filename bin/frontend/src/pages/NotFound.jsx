import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="card border-0 shadow-sm rounded-4 p-5 bg-white border border-light-subtle" style={{ maxWidth: '480px' }}>
        <h1 className="display-1 fw-bold text-gradient mb-3">404</h1>
        <h3 className="fs-4 fw-bold display-font text-dark-emphasis mb-2">Page Not Found</h3>
        <p className="text-secondary small mb-4">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="d-flex gap-2 justify-content-center">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary rounded-pill px-4"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn rounded-pill px-4 text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
