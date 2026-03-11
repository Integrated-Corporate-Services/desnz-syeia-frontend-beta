import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSessionTimeout } from '../context/SessionTimeoutContext';
import { useLocation } from 'react-router-dom';
import { createLogger } from '../utils/logger';
import '../styles/SessionTimeout.css'

const logger = createLogger('SessionTimeoutModal');

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatSeconds = (sec: number) => {
  return `${sec} second${sec !== 1 ? 's' : ''}`;
};

const SessionTimeoutModal: React.FC = () => {
  const { showModal, remaining, resetTimer, handleLogout } = useSessionTimeout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);
  const staySignedInRef = useRef<HTMLButtonElement>(null);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleLogoutClick = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      window.location.href = '/frontend/signed-out';
    } catch (err) {
      logger.error('Logout failed:', err);
      window.location.href = '/frontend/signed-out';
    }
  }, [handleLogout]);

  const handleContinueClick = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Always show the same warning message on all pages
  const answerWarning = useMemo(() => {
    return "Any answers you have not submitted may be lost.";
  }, []);

  // Memoize time display format
  const timeDisplay = useMemo(() => {
    const showCountdown = remaining < 60;
    return showCountdown ? formatSeconds(remaining) : "2 minutes";
  }, [remaining]);

  React.useEffect(() => {
    logger.debug('SessionTimeout modal - showModal:', showModal, 'remaining:', remaining);
  }, [showModal, remaining]);

  // Focus management and accessibility - only when modal first shows
  useEffect(() => {
    if (showModal && modalRef.current) {
      // Only focus and announce when modal first appears, not on every countdown update
      modalRef.current.focus();
      
      setTimeout(() => {
        staySignedInRef.current?.focus();
      }, 100);
    }
  }, [showModal]); // Remove 'remaining' dependency to prevent re-runs

  // Separate effect for screen reader announcements only when necessary
  useEffect(() => {
    if (showModal && remaining === 119) { // Only announce when modal first shows (2 min = 120s - 1s)
      const announcement = `You're about to be signed out. For your security, we will sign you out in 2 minutes.`;
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'assertive');
      ariaLive.setAttribute('aria-atomic', 'true');
      ariaLive.className = 'govuk-visually-hidden';
      ariaLive.textContent = announcement;
      document.body.appendChild(ariaLive);
      
      setTimeout(() => {
        if (document.body.contains(ariaLive)) {
          document.body.removeChild(ariaLive);
        }
      }, 1000);
    }
  }, [showModal, remaining]);

  // Keyboard navigation and focus trapping
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Allow escape to continue session
        handleContinueClick();
        return;
      }

      // Focus trapping
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div 
      className="govuk-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeout-title"
      aria-describedby="timeout-description"
    >
      <div 
        ref={modalRef}
        className="govuk-modal govuk-!-margin-auto" 
        tabIndex={-1}
      >
        <h2 className="govuk-heading-m" id="timeout-title">You're about to be signed out</h2>
        <div id="timeout-description">
          <p className="govuk-body">
            For your security, we will sign you out in{' '}
            <strong>{timeDisplay}</strong>.
          </p>
          {answerWarning && (
            <p className="govuk-body govuk-!-text-colour-secondary">
              {answerWarning}
            </p>
          )}
        </div>
        <div className="govuk-button-group">
          <button 
            ref={staySignedInRef}
            className="govuk-button" 
            type="button" 
            onClick={handleContinueClick}
            disabled={isLoggingOut}
            data-module="govuk-button"
            aria-describedby="stay-description"
          >
            Stay signed in
          </button>
          <span id="stay-description" className="govuk-visually-hidden">
            This will refresh your session and keep you signed in
          </span>
          <button 
            className="govuk-link govuk-!-display-block govuk-!-margin-top-3" 
            type="button" 
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            style={{ background: 'none', border: 'none', textDecoration: 'underline', color: '#1d70b8', cursor: 'pointer' }}
            aria-describedby="signout-description"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
          <span id="signout-description" className="govuk-visually-hidden">
            This will immediately sign you out and end your session
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;