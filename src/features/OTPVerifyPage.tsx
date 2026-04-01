import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { createLogger } from '../utils/logger';

const logger = createLogger('OTPVerifyPage');

const OTPVerifyPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();
      const user = useAuthStore();
  // Get person_id from sessionStorage (set after login/callback)
  const personId = useAuthStore((state) => state.user?.person_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!personId) {
      setError('Person ID not found. Please login again.');
      return;
    }
    try {
      const response = await fetch('/backend/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ person_id: personId, otp }),
      });
      const data = await response.json();
      logger.info('OTP verify response:', data);
      if (data.user) {
        useAuthStore.setState({ user: data.user });
      }
      if (data.user && data.user.otpVerified === true) {
        navigate('/workbasket');
      } else {
        setError(data.error || 'OTP verification failed. Please try again.');
        // Show resend link if OTP expired or any error
        setShowResend(true);
      }
    } catch {
      setError('Error verifying OTP.');
      setShowResend(true);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setError('');
    setShowResend(false);
    try {
      // Use user email from auth store
      const email = useAuthStore.getState().user?.email;
      if (!email) {
        setError('Email not found. Please login again.');
        return;
      }
      const response = await fetch('/backend/auth/create-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setError('A new OTP has been sent to your email.');
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half govuk-!-margin-top-6">
          <h1 className="govuk-heading-xl">Enter your One Time Passcode (OTP)</h1>
          <form
            onSubmit={handleSubmit}
            className="govuk-form-group"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '1rem',
              maxWidth: '350px',
            }}
          >
            <label className="govuk-label govuk-label--l" htmlFor="otp-input">
              OTP code
            </label>
                        {error && <span className="govuk-error-message">{error}</span>}
                        {showResend && (
                          <button
                            type="button"
                            className="govuk-link govuk-!-margin-top-2"
                            style={{ background: 'none', border: 'none', color: '#005ea5', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                            onClick={handleResendOtp}
                          >
                            Resend OTP
                          </button>
                        )}

            <input
              id="otp-input"
              name="otp"
              type="text"
              className="govuk-input govuk-!-width-full"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
            <button
              type="submit"
              className="govuk-button govuk-!-margin-top-2 govuk-!-margin-bottom-2"
              style={{ alignSelf: 'flex-start' }}
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerifyPage;