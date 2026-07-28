import React, { Component, ReactNode } from 'react';
import { mapErrorToUserMessage, createSafeErrorLog } from '../utils/errorMapper';
import { createLogger } from '../utils/logger';
import { isDevelopmentMode } from '../config/runtimeEnv';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional context identifier for error logging */
  context?: string;
}

interface State {
  hasError: boolean;
  /** User-friendly error message (sanitized) */
  userMessage?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Get sanitized user-friendly message
    const userMessage = mapErrorToUserMessage(error, 'ErrorBoundary');
    return { hasError: true, userMessage };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log full technical details for debugging (never shown to user)
    const safeError = createSafeErrorLog(error);
    logger.error('Error caught by boundary', {
      context: this.props.context,
      error: safeError,
      componentStack: errorInfo.componentStack,
      // Only log full error info in development
      ...(isDevelopmentMode() && { 
        fullError: error,
        errorInfo 
      }),
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">
              {/* Display sanitized user-friendly message only */}
              {this.state.userMessage || 'Something went wrong. Please refresh the page or contact support if the problem persists.'}
            </p>
            {/* Technical details are NEVER shown to users, only logged */}
            {/* In development mode, developers can see errors in browser console */}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
