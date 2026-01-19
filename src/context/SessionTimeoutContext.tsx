import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { logout } from '../services/authService';

interface SessionTimeoutContextType {
  showModal: boolean;
  remaining: number;
  resetTimer: () => void;
  handleLogout: () => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

const TIMEOUT = 30 * 60; // 30 min in seconds
const WARNING = 5 * 60; // 5 min in seconds

export const SessionTimeoutProvider = ({ children }: { children: ReactNode }) => {
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(WARNING);
  const timerRef = useRef<number | null>(null);
  const idleRef = useRef<number>(0);

  // Reset timer on user activity
  const resetTimer = () => {
    idleRef.current = 0;
    setShowModal(false);
    setRemaining(WARNING);
  };

  // Logout logic
  const handleLogout = async () => {
          logout(); // Call logout with no arguments
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const activity = () => {
      // Only reset timer if modal is NOT shown
      if (!showModal) {
        resetTimer();
      }
    };
    events.forEach(e => window.addEventListener(e, activity));
    return () => events.forEach(e => window.removeEventListener(e, activity));
  }, [showModal]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      idleRef.current += 1;
      if (idleRef.current >= TIMEOUT - WARNING && idleRef.current < TIMEOUT) {
        setShowModal(true);
        setRemaining(TIMEOUT - idleRef.current);
      } else if (idleRef.current >= TIMEOUT) {
        setShowModal(false);
        handleLogout();
      }
    }, 1000);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Countdown in modal
  useEffect(() => {
    if (!showModal) return undefined;
    const modalTimer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setShowModal(false);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(modalTimer);
    };
  }, [showModal]);

  return (
    <SessionTimeoutContext.Provider value={{ showModal, remaining, resetTimer, handleLogout }}>
      {children}
    </SessionTimeoutContext.Provider>
  );
};

export const useSessionTimeout = () => {
  const ctx = useContext(SessionTimeoutContext);
  if (!ctx) throw new Error('useSessionTimeout must be used within SessionTimeoutProvider');
  return ctx;
};