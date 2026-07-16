import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const VerifyOtp = () => {
  const { verifyRegistrationOtp, verifyLoginOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';
  const purpose = queryParams.get('purpose') || 'REGISTER'; // REGISTER or LOGIN

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Identifier is missing. Redirecting to login.');
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown timer logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Allow only numbers

    const newValues = [...otpValues];
    newValues[index] = value.substring(value.length - 1); // Get last typed character
    setOtpValues(newValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.warning('Please paste a valid 6-digit code');
      return;
    }

    const newValues = pastedData.split('');
    setOtpValues(newValues);
    inputRefs.current[5].focus(); // Focus last input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otpValues.join('');
    if (code.length < 6) {
      toast.warning('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    let result;
    if (purpose === 'REGISTER') {
      result = await verifyRegistrationOtp(email, code);
    } else {
      result = await verifyLoginOtp(email, code);
    }
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      if (purpose === 'REGISTER') {
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    const result = await resendOtp(email, purpose);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setTimer(60);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } else {
      toast.error(result.message);
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
          <h2 className="fs-4 display-font fw-semibold">Security Verification</h2>
          <p className="text-secondary small">
            We have sent a verification code to:<br />
            <strong className="text-dark">{email}</strong>
          </p>
        </div>

        <div className="form-glass shadow-sm border border-light-subtle rounded-4 bg-white p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary d-block text-center mb-3">
                Enter 6-Digit OTP
              </label>
              
              <div className="d-flex justify-content-between gap-2" onPaste={handlePaste}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    className="form-control text-center fw-bold fs-4 rounded-3"
                    style={{
                      width: '48px',
                      height: '52px',
                      borderColor: val ? '#6366f1' : 'var(--bs-border-color)',
                      boxShadow: val ? '0 0 0 0.25rem rgba(99, 102, 241, 0.25)' : 'none'
                    }}
                    value={val}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    required
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 rounded-pill py-2.5 text-white fw-medium d-flex align-items-center justify-content-center gap-2 mb-3"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <i className="material-icons-round fs-6">verified_user</i>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            {canResend ? (
              <button
                onClick={handleResend}
                className="btn btn-link text-indigo fw-medium text-decoration-none p-0"
                style={{ color: '#6366f1' }}
                disabled={loading}
              >
                Resend OTP Code
              </button>
            ) : (
              <span className="text-secondary small">
                Resend code in <strong className="text-indigo" style={{ color: '#6366f1' }}>{timer}s</strong>
              </span>
            )}
          </div>

          <div className="mt-4 text-center border-top border-light-subtle pt-3">
            <Link to="/login" className="text-secondary small text-decoration-none d-flex align-items-center justify-content-center gap-1">
              <i className="material-icons-round fs-6">arrow_back</i>
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
