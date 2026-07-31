import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSessionTimeout } from '../context/SessionTimeoutContext';
import { useAuthUserContext } from '../context/AuthUserContext';
import { createLogger } from '../utils/logger';
import '../styles/SessionTimeout.css'
import { logout, keepAlive } from '../services/authService';
import { SESSION_WARNING, SIGNED_OUT_PAGE } from '../constants/sessionTimeout';

const logger = createLogger('SessionTimeoutModal');

const formatSeconds = (sec: number) => {
  return `${sec} second${sec !== 1 ? 's' : ''}`;
};

const SessionTimeoutModal: React.FC = () => {
  // Context hooks
  const { showModal, remaining, resetTimer } = useSessionTimeout();
  const { user, authenticated } = useAuthUserContext();
  
  // Component state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAnnounced, setHasAnnounced] = useState(false);
  
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const staySignedInRef = useRef<HTMLButtonElement>(null);


  /**
   * Handles "Stay signed in" button click
   * 1. Validates that timeout hasn't expired on client side
   * 2. Calls backend keep-alive endpoint to refresh server-side session
   * 3. If successful, resets frontend timer
   * 4. If backend session expired (401), logs out immediately
   * 5. If error, resets frontend timer anyway (next API call will handle auth)
   */
  const handleContinueClick = useCallback(async () => {
    try {
      // Client-side validation: Don't allow refresh if time has already expired
      if (remaining <= 0) {
        await logout(SIGNED_OUT_PAGE);
        return;
      }

      setIsRefreshing(true);
      logger.info('User clicked "Stay signed in" - refreshing backend session');
      
      // Call backend keep-alive endpoint to refresh the session on the server
      const sessionRefreshed = await keepAlive();
      
      if (!sessionRefreshed) {
        // Backend session already expired (401) - logout user
        logger.warn('Backend session already expired - logging out');
        await logout(SIGNED_OUT_PAGE);
        return;
      }

      logger.info('Backend session refreshed successfully - resetting frontend timer');
      
      // Reset the frontend timer (both backend and frontend now synchronized)
      resetTimer();
    } catch (error) {
      logger.error('Error refreshing session', error);
      // Still reset frontend timer even if backend call fails
      // The next API call will handle the authentication error
      resetTimer();
    } finally {
      setIsRefreshing(false);
    }
  }, [resetTimer, remaining]);

  // Always show the same warning message on all pages
  const answerWarning = useMemo(() => {
    return "Any information you entered that was not saved may be lost.";
  }, []);

  // Memoize time display format
  const timeDisplay = useMemo(() => {
    const showCountdown = remaining < 60;
    const warningMinutes = Math.floor(SESSION_WARNING / 60);
    const warningText = warningMinutes === 1 ? "1 minute" : `${warningMinutes} minutes`;
    return showCountdown ? formatSeconds(remaining) : warningText;
  }, [remaining]);

  // Force logout when countdown reaches 0 (safety mechanism)
  React.useEffect(() => {
    if (showModal && remaining <= 0) {
      logout(SIGNED_OUT_PAGE);
    }
  }, [showModal, remaining]);

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
      const announcement = `You're about to be signed out. For your security, we'll sign you out in ${timeDisplay}.`;
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
  }, [showModal, handleContinueClick]);

  // Only show modal if user is authenticated
  if (!authenticated || !user) {
    logger.debug('Modal render check: user not authenticated, not rendering');
    return null;
  }

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
            For your security, we'll sign you out in{' '}
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
            disabled={remaining <= 0 || isRefreshing} 
            type="button" 
            onClick={handleContinueClick}
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
                if (!isRefreshing) {
                  await logout();
                }
              }}
              aria-describedby="signout-description"
              style={{ 
                pointerEvents: isRefreshing ? 'none' : 'auto',
                opacity: isRefreshing ? 0.5 : 1 
              }}
            >
              Sign out
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