import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState(''); // UUID recovery token
  const [step, setStep] = useState(1); // 1: Request, 2: Reset Form
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.warning('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/forgot-password/initiate', {
        identifier: identifier.trim()
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setToken(response.data.data); // Save the returned UUID token
        setStep(2); // Go to step 2 (Enter OTP & Reset Password)
      } else {
        toast.error(response.data.message || 'Failed to initiate recovery.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'User not found or connection failed.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.warning('OTP must be exactly 6 digits');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/forgot-password/reset', {
        identifier: identifier.trim(),
        token: token,
        otp: otp.trim(),
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid OTP or token request.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-3">
            <i className="material-icons-round fs-2" style={{ color: '#6366f1' }}>mic</i>
            <span className="h3 mb-0 display-font fw-bold text-gradient">Voice Notes</span>
          </Link>
          <h2 className="fs-4 display-font fw-semibold">Reset Password</h2>
          <p className="text-secondary small">Recover access to your account securely</p>
        </div>

        <div className="form-glass shadow-sm border border-light-subtle rounded-4 bg-white p-4">
          {step === 1 ? (
            <form onSubmit={handleInitiate}>
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Email or Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="name@example.com or +1234567890"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <div className="form-text small text-muted mt-2" style={{ fontSize: '0.78rem' }}>
                  We will send a YES/NO confirmation notification to both your email and phone to verify your identity.
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 btn-indigo rounded-pill py-2.5 fw-medium d-flex align-items-center justify-content-center gap-2 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Sending links...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Links</span>
                    <i className="material-icons-round fs-6">send</i>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <div className="alert alert-indigo-subtle d-flex align-items-start gap-2 mb-4 p-3 rounded-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', color: '#475569' }}>
                <i className="material-icons-round text-indigo mt-0.5" style={{ color: '#6366f1', fontSize: '18px' }}>info</i>
                <div style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                  A verification request has been sent. Open your email or SMS and click <strong>"Yes, it was me"</strong> to generate your OTP.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Verification OTP Code</label>
                <input
                  type="text"
                  className="form-control text-center fw-bold"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  style={{ letterSpacing: '4px', fontSize: '1.1rem' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 btn-indigo rounded-pill py-2.5 fw-medium d-flex align-items-center justify-content-center gap-2 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <i className="material-icons-round fs-6">lock_reset</i>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 text-center border-top border-light-subtle pt-3">
            <Link to="/login" className="text-indigo fw-medium text-decoration-none small" style={{ color: '#6366f1' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
