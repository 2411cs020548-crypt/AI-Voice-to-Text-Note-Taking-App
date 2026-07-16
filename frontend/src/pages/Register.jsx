import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      toast.warning('All fields are required');
      return;
    }

    if (password.length < 8) {
      toast.warning('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(name, email, phoneNumber, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=REGISTER`);
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
          <h2 className="fs-4 display-font fw-semibold">Create Account</h2>
          <p className="text-secondary small">Start capturing notes with your voice</p>
        </div>

        <div className="form-glass shadow-sm border border-light-subtle rounded-4 bg-white p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Password (Min 8 characters)</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <i className="material-icons-round fs-6">person_add</i>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center border-top border-light-subtle pt-3">
            <div className="text-secondary small">
              Already have an account? <Link to="/login" className="text-indigo fw-medium text-decoration-none" style={{ color: '#6366f1' }}>Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
