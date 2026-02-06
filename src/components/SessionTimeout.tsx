import React, { useState } from 'react';
import { useSessionTimeout } from '../context/SessionTimeoutContext';
import '../styles/SessionTimeout.css'

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const SessionTimeoutModal: React.FC = () => {
  const { showModal, remaining, resetTimer, handleLogout } = useSessionTimeout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  React.useEffect(() => {
    console.log('🎯 SessionTimeout modal - showModal:', showModal, 'remaining:', remaining);
  }, [showModal, remaining]);

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback redirect
      window.location.href = '/backend/auth/login';
    }
  };

  const handleContinueClick = () => {
    resetTimer();
  };

  if (!showModal) return null;

  return (
    <div className="govuk-modal-overlay">
      <div className="govuk-modal govuk-!-margin-auto" role="dialog" aria-modal="true" aria-labelledby="timeout-title">
        <h2 className="govuk-heading-m" id="timeout-title">Your session is about to expire</h2>
        <p className="govuk-body">You have been inactive for a while. Your session will end in <strong>{formatTime(remaining)}</strong>.</p>
        <div className="govuk-button-group">
          <button 
            className="govuk-button" 
            type="button" 
            onClick={handleContinueClick}
            disabled={isLoggingOut}
            data-module="govuk-button"
          >
            Continue session
          </button>
          <button 
            className="govuk-button govuk-button--warning" 
            type="button" 
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            data-module="govuk-button"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;