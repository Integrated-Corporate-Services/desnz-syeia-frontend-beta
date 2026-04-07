import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSessionTimeout } from '../context/SessionTimeoutContext';
import { useLocation } from 'react-router-dom';
import { createLogger } from '../utils/logger';
import '../styles/SessionTimeout.css'
import { logout } from '../services/authService';

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

  const modalRef = useRef<HTMLDivElement>(null);
  const staySignedInRef = useRef<HTMLButtonElement>(null);


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

  // Track if we've already announced to screen readers
  const [hasAnnounced, setHasAnnounced] = useState(false);

  React.useEffect(() => {
    if (showModal) {
      logger.info(`SessionTimeout component - MODAL IS VISIBLE, remaining: ${remaining}s`);
    } else {
      logger.debug('SessionTimeout component - modal is hidden');
    }
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

  // Separate effect for screen reader announcements only when modal first shows
  useEffect(() => {
    if (showModal && !hasAnnounced) {
      setHasAnnounced(true);
      const announcement = `You're about to be signed out. For your security, we will sign you out in ${timeDisplay}.`;
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
  }, [showModal, hasAnnounced, timeDisplay]);

  // Reset announcement state when modal is hidden
  useEffect(() => {
    if (!showModal) {
      setHasAnnounced(false);
    }
  }, [showModal]);

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

  if (!showModal) {
    logger.debug('Modal render check: showModal is false, not rendering');
    return null;
  }

  logger.info(` Modal render check: showModal is TRUE, RENDERING MODAL NOW with ${remaining}s remaining`);

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
        <h1 className="govuk-heading-m" id="timeout-title">You're about to be signed out</h1>
        <div id="timeout-description">
          <p className="govuk-body">
            For your security, we will sign you out in{' '}
            <strong>{timeDisplay}</strong>.
          </p>
          <p className="govuk-body">
            {answerWarning}
          </p>
        </div>
        <div className="govuk-!-margin-top-4">
          <button 
            ref={staySignedInRef}
            className="govuk-button govuk-button--success" 
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
          <p className="govuk-!-margin-top-3">
            <a 
              href="#"
              className="govuk-link" 
              onClick={async (event) => {
                                event.preventDefault();
                                await logout();
                              }}
              aria-describedby="signout-description"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </a>
          </p>
          <span id="signout-description" className="govuk-visually-hidden">
            This will immediately sign you out and end your session
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;