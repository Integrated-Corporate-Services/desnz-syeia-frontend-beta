import React from 'react';
import { useSessionTimeout } from '../context/SessionTimeoutContext';
import '../styles/SessionTimeout.css'

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const SessionTimeoutModal: React.FC = () => {
  const { showModal, remaining, resetTimer, handleLogout } = useSessionTimeout();
  if (!showModal) return null;
  return (
    <div className="govuk-modal-overlay">
      <div className="govuk-modal govuk-!-margin-auto" role="dialog" aria-modal="true" aria-labelledby="timeout-title">
        <h2 className="govuk-heading-m" id="timeout-title">Your session is about to expire</h2>
        <p className="govuk-body">You have been inactive for a while. Your session will end in <strong>{formatTime(remaining)}</strong>.</p>
        <div className="govuk-button-group">
          <button className="govuk-button" type="button" onClick={resetTimer} data-module="govuk-button">Continue session</button>
          <button className="govuk-button govuk-button--warning" type="button" onClick={handleLogout} data-module="govuk-button">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;