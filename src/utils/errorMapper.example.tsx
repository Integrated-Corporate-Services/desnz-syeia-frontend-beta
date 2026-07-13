/**
 * Error Mapper Usage Examples
 * 
 * This file demonstrates how to use the error mapper utility
 * to sanitize error messages throughout the application.
 */

import React, { useState } from 'react';
import { 
  mapErrorToUserMessage, 
  ErrorMessages, 
  isApiError,
  hasValidationErrors 
} from './errorMapper';

/**
 * Example 1: Basic error handling in a form submission
 */
export function FormSubmissionExample() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/backend/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw await response.json();
      }

      // Success handling
    } catch (err) {
      // OLD WAY (INSECURE - exposes details):
      // setError(err.message);
      
      // NEW WAY (SECURE - sanitized message):
      setError(mapErrorToUserMessage(err, 'FormSubmission'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p>{error}</p> {/* Shows sanitized message only */}
          </div>
        </div>
      )}
      {/* Form fields */}
    </div>
  );
}

/**
 * Example 2: File upload with specific error messages
 */
export function FileUploadExample() {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        setError(ErrorMessages.FILE_TOO_LARGE);
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError(ErrorMessages.FILE_TYPE_INVALID);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/backend/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw await response.json();
      }

      // Success
    } catch (err) {
      // Use specific message or fall back to sanitized message
      setError(mapErrorToUserMessage(err, 'FileUpload') || ErrorMessages.FILE_UPLOAD_FAILED);
    }
  };

  return (
    <div>
      {error && (
        <div className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </div>
      )}
      {/* File upload component */}
    </div>
  );
}

/**
 * Example 3: API call with validation errors
 */
export function ValidationErrorExample() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    try {
      const response = await fetch('/backend/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      // Success
    } catch (err: any) {
      // Check if error has field-specific validation errors
      if (hasValidationErrors(err)) {
        // Display field-specific errors (already user-friendly)
        setErrors(err.validationErrors);
        setGeneralError(null);
      } else {
        // Display general error (sanitized)
        setErrors({});
        setGeneralError(mapErrorToUserMessage(err, 'DataSave'));
      }
    }
  };

  return (
    <div>
      {generalError && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p>{generalError}</p>
          </div>
        </div>
      )}
      
      {Object.entries(errors).map(([field, message]) => (
        <div key={field} className="govuk-form-group govuk-form-group--error">
          <p className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {message}
          </p>
        </div>
      ))}
      {/* Form fields */}
    </div>
  );
}

/**
 * Example 4: Custom hook for error handling
 */
export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any, context?: string) => {
    const userMessage = mapErrorToUserMessage(err, context);
    setError(userMessage);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}

// Usage of custom hook
export function ComponentUsingHook() {
  const { error, handleError, clearError } = useApiError();

  const fetchData = async () => {
    try {
      const response = await fetch('/backend/api/data');
      if (!response.ok) throw await response.json();
      // Handle success
      clearError();
    } catch (err) {
      handleError(err, 'DataFetch');
    }
  };

  return (
    <div>
      {error && <div className="govuk-error-message">{error}</div>}
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
}

/**
 * Example 5: Error handling in catch blocks
 */
export async function secureApiCall() {
  try {
    const response = await fetch('/backend/api/endpoint');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    return await response.json();
    
  } catch (error) {
    // NEVER do this (exposes technical details):
    // console.log('API Error:', error.message);
    // alert(error.message);
    // throw new Error(`Failed to fetch: ${error.message}`);
    
    // ALWAYS do this (sanitized):
    const userMessage = mapErrorToUserMessage(error, 'ApiCall');
    console.error('API call failed', { userMessage }); // Log sanitized only
    throw new Error(userMessage);
  }
}

/**
 * Example 6: Error boundary with context
 */
export function MapComponent() {
  return (
    <ErrorBoundary context="MapView">
      {/* Map implementation */}
      <div>Map content here</div>
    </ErrorBoundary>
  );
}

/**
 * Example 7: Checking error types
 */
export function handleApiResponse(error: any) {
  if (isApiError(error)) {
    // Handle API errors specifically
    if (error.status === 401) {
      // Redirect to login (handled by apiErrorHandler)
      return ErrorMessages.SESSION_EXPIRED;
    }
    
    if (error.status === 403) {
      return ErrorMessages.GENERIC_ERROR; // Don't reveal authorization details
    }
  }
  
  // For all other errors, use mapper
  return mapErrorToUserMessage(error, 'ApiResponse');
}

/**
 * BEFORE/AFTER Comparison
 */

// ❌ BEFORE (INSECURE - Information Disclosure):
export function InsecureComponent() {
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('/backend/api/submit');
      if (!response.ok) {
        const error = await response.json();
        // PROBLEM: Exposes technical details
        setError(error.message); 
        // User sees: "Joi validation failed: email must be a valid email format at Object.validateEmail (/src/validators/email.ts:42:10)"
      }
    } catch (err: any) {
      // PROBLEM: Exposes stack traces
      setError(err.message);
      // User sees: "TypeError: Cannot read property 'data' of undefined at processResponse (apiClient.ts:125)"
    }
  };

  return <div>{error && <p>Error: {error}</p>}</div>;
}

// ✅ AFTER (SECURE - Sanitized Messages):
export function SecureComponent() {
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('/backend/api/submit');
      if (!response.ok) {
        const error = await response.json();
        // SECURE: Maps to user-friendly message
        setError(mapErrorToUserMessage(error, 'Submit'));
        // User sees: "Please check your input and try again."
        // Technical details logged for developers (console only)
      }
    } catch (err: any) {
      // SECURE: Generic message
      setError(mapErrorToUserMessage(err, 'Submit'));
      // User sees: "Something went wrong. Please try again or contact support if the problem persists."
    }
  };

  return <div>{error && <p>Error: {error}</p>}</div>;
}

/**
 * Testing different error scenarios
 */
export function testErrorScenarios() {
  const scenarios = [
    // Validation error (Joi)
    { message: 'Joi validation failed: email must be valid', expected: 'Please check your input and try again.' },
    
    // Database error
    { message: 'Database query failed: SELECT * FROM users', expected: 'Something went wrong...' },
    
    // Stack trace
    { message: 'TypeError at handleSubmit (component.tsx:42:10)', expected: 'Something went wrong...' },
    
    // API endpoint exposure
    { message: 'Failed to POST /backend/api/internal/sensitive-data', expected: 'Unable to connect to the service...' },
    
    // Network error
    { message: 'Network request failed', expected: 'Unable to connect to the service...' },
    
    // 401 error
    { status: 401, message: 'Unauthorized', expected: 'Your session has expired...' },
    
    // 403 error
    { status: 403, message: 'Forbidden', expected: 'You do not have permission...' },
  ];

  scenarios.forEach(scenario => {
    const result = mapErrorToUserMessage(scenario);
    console.log(`Input: ${scenario.message}`);
    console.log(`Output: ${result}`);
    console.log('---');
  });
}

/**
 * Integration with existing error handlers
 */

// In your existing service files, update error handling:

// OLD:
// catch (error) {
//   setError(error.message); // ❌ Exposes details
// }

// NEW:
// catch (error) {
//   setError(mapErrorToUserMessage(error, 'ServiceName')); // ✅ Sanitized
// }
