import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-100" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-3">
            <i className="material-icons-round fs-2" style={{ color: '#6366f1' }}>mic</i>
            <span className="h3 mb-0 display-font fw-bold text-gradient">Voice Notes</span>
          </Link>
          <h2 className="fs-4 display-font fw-semibold">Welcome Back</h2>
          <p className="text-secondary small">Please enter your credentials to log in</p>
        </div>

        <div className="form-glass shadow-sm border border-light-subtle rounded-4 bg-white p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100 rounded-pill py-2.5 text-white fw-medium d-flex align-items-center justify-content-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="material-icons-round fs-6">arrow_forward</i>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center border-top border-light-subtle pt-3">
            <div className="text-secondary small">
              Don't have an account? <Link to="/register" className="text-indigo fw-medium text-decoration-none" style={{ color: '#6366f1' }}>Sign Up</Link>
            </div>
            <div className="mt-3 text-muted small bg-light p-2 rounded text-start" style={{ fontSize: '0.8rem' }}>
              <strong>Demo Credentials:</strong><br />
              Email: <code>john@example.com</code><br />
              Password: <code>password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
