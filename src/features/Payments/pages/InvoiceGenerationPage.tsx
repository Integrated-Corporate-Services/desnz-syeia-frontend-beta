import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('InvoiceGenerationPage');

const InvoiceGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  
  const [loading, setLoading] = useState(false);
  
  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;

  // Get payment amounts from location state (passed from PaymentAmountPage)
  const { 
    consentFee = 0, 
    screeningFee = 0, 
    eiaFee = 0, 
    totalAmount = 0,
    breakdown = null 
  } = location.state || {};

  // Add ref to track if invoice has been generated
  const hasGeneratedRef = useRef(false);
  const hasAttemptedRef = useRef(false);

  const generationGuardKey = applicationId
    ? `invoice_generation_in_progress_${applicationId}`
    : 'invoice_generation_in_progress';

  const clearGenerationGuard = useCallback(() => {
    sessionStorage.removeItem(generationGuardKey);
  }, [generationGuardKey]);

  const navigateToErrorPage = useCallback(
    (code: string, message: string) => {
      setLoading(false);
      navigate(`${baseUrl}/${applicationId}/generate-invoice-error`, {
        state: {
          errorCode: code,
          errorMessage: message,
          consentFee,
          screeningFee,
          eiaFee,
          totalAmount,
          breakdown,
        },
        replace: true,
      });
    },
    [
      applicationId,
      baseUrl,
      navigate,
      consentFee,
      screeningFee,
      eiaFee,
      totalAmount,
      breakdown,
    ]
  );

  const getErrorMessage = useCallback((code: string, message?: string) => {
    switch (code) {
      case 'NETWORK_LOST':
        return 'Your network connection was lost while we were generating your invoice. Reconnect and try again.';
      case 'INVOICE_GENERATION_TIMEOUT':
        return 'Invoice generation took longer than expected. Return to your application and try again.';
      case 'INVOICE_GENERATION_IN_PROGRESS':
        return 'Invoice generation is already in progress. Please wait and try again.';
      default:
        return message || 'You can return to the application and try again later.';
    }
  }, []);

  const navigateToInvoiceIfExists = useCallback(async () => {
    if (!applicationId) {
      return false;
    }

    try {
      const statusResponse = await fetch(`/backend/api/invoice/${applicationId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!statusResponse.ok) {
        return false;
      }

      const status = await statusResponse.json();
      if (!status.invoiceExists) {
        return false;
      }

      clearGenerationGuard();
      navigate(`${baseUrl}/${applicationId}/invoice-download`, {
        state: {
          invoiceNumber: status.invoiceNumber,
          s3Key: status.s3Key,
          consentFee,
          screeningFee,
          eiaFee,
          totalAmount,
        },
        replace: true,
      });
      return true;
    } catch {
      return false;
    }
  }, [
    applicationId,
    baseUrl,
    navigate,
    clearGenerationGuard,
    consentFee,
    screeningFee,
    eiaFee,
    totalAmount,
  ]);

  const handleGenerateInvoice = useCallback(async () => {
    // Prevent duplicate calls
    if (hasGeneratedRef.current) {
      logger.info('[InvoiceGenerationPage] Invoice already generated, skipping');
      return;
    }

    if (!applicationId) {
      navigateToErrorPage('INVOICE_GENERATION_FAILED', 'Application ID is missing.');
      return;
    }

    if (!navigator.onLine) {
      navigateToErrorPage('NETWORK_LOST', getErrorMessage('NETWORK_LOST'));
      return;
    }

    hasGeneratedRef.current = true; // Mark as generated
    hasAttemptedRef.current = true;
    sessionStorage.setItem(generationGuardKey, Date.now().toString());

    let timeoutId: number | undefined;

    try {
      setLoading(true);

      // Prepare invoice data with dynamic fees
      const invoiceData = {
        userName: user?.full_name || 'User',
        userEmail: user?.email || '',
        consentFee: consentFee,
        screeningFee: screeningFee,  
        eiaFee: eiaFee,              
        totalAmount: totalAmount,
        breakdown: breakdown
      };

      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), 60000);

      // Call backend API with applicationId in URL
      const response = await fetch(
        `/backend/api/invoice/${applicationId}/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify(invoiceData),
        }
      );

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const backendCode = errorData.code || 'INVOICE_GENERATION_FAILED';

        if (response.status === 409 && backendCode === 'INVOICE_GENERATION_IN_PROGRESS') {
          const hasInvoiceNow = await navigateToInvoiceIfExists();
          if (hasInvoiceNow) {
            return;
          }
        }

        const serviceError = new Error(errorData.error || 'Failed to generate invoice');
        serviceError.name = backendCode;
        throw serviceError;
      }

      const result = await response.json();
      clearGenerationGuard();
      
      navigate(`${baseUrl}/${applicationId}/invoice-download`, {
        state: {
          invoiceNumber: result.invoiceNumber,
          s3Key: result.s3Key,
          consentFee,
          screeningFee,  
          eiaFee,        
          totalAmount,
        }
      });

    } catch (err: any) {
      hasGeneratedRef.current = false; // Reset on error to allow retry
      if (err?.name === 'AbortError') {
        navigateToErrorPage('INVOICE_GENERATION_TIMEOUT', getErrorMessage('INVOICE_GENERATION_TIMEOUT'));
      } else if (!navigator.onLine) {
        navigateToErrorPage('NETWORK_LOST', getErrorMessage('NETWORK_LOST'));
      } else {
        const code = err?.name || 'INVOICE_GENERATION_FAILED';
        navigateToErrorPage(code, getErrorMessage(code, err.message));
      }
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  }, [
    applicationId,
    baseUrl,
    clearGenerationGuard,
    consentFee,
    screeningFee,
    eiaFee,
    totalAmount,
    breakdown,
    user?.full_name,
    user?.email,
    navigate,
    generationGuardKey,
    navigateToInvoiceIfExists,
    getErrorMessage,
    navigateToErrorPage,
  ]);

  useEffect(() => {
    const handleOffline = () => {
      if (loading) {
        navigateToErrorPage('NETWORK_LOST', getErrorMessage('NETWORK_LOST'));
      }
    };

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [loading, getErrorMessage, navigateToErrorPage]);

  // Auto-generate invoice on page load
  useEffect(() => {
    if (applicationId && totalAmount > 0 && !hasGeneratedRef.current) {
      const inProgress = sessionStorage.getItem(generationGuardKey);
      if (inProgress && !hasAttemptedRef.current) {
        navigateToErrorPage(
          'INVOICE_GENERATION_IN_PROGRESS',
          getErrorMessage('INVOICE_GENERATION_IN_PROGRESS')
        );
        return;
      }
      handleGenerateInvoice();
    } else if (applicationId && totalAmount === 0) {
      navigateToErrorPage(
        'INVOICE_GENERATION_FAILED',
        'Payment amount is not available. Please return to the application and try again.'
      );
    } 
  }, [
    applicationId,
    totalAmount,
    handleGenerateInvoice,
    generationGuardKey,
    getErrorMessage,
    navigateToErrorPage,
  ]);

  useEffect(() => {
    return () => {
      if (!loading) {
        clearGenerationGuard();
      }
    };
  }, [loading, clearGenerationGuard]);

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" aria-busy={loading}>
        {/* <div className="govuk-grid-row"> */}
          {/* <div className="govuk-grid-column-two-thirds"> */}
            {loading && (
              <>
                {/* Important Banner */}
                <div style={{ 
                  border: '5px solid #1d70b8',
                  marginBottom: '30px'
                }}>
                  <div style={{ 
                    backgroundColor: '#1d70b8',
                    padding: '10px 15px'
                  }}>
                    <h2 style={{ 
                      color: '#ffffff',
                      margin: 0,
                      fontSize: '19px',
                      fontWeight: 700,
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      Important
                    </h2>
                  </div>
                  <div style={{ 
                    backgroundColor: '#ffffff',
                    padding: '15px',
                    border: '1px solid #b1b4b6'
                  }}>
                    <p style={{ 
                      margin: 0,
                      fontSize: '19px',
                      lineHeight: '1.5',
                      fontFamily: 'Arial, sans-serif',
                      color: '#0b0c0c'
                    }}>
                      <strong>Please do not close this window or navigate away from this page while we generate your invoice.</strong>
                    </p>
                  </div>
                </div>

                {/* Loading Spinner and Text */}
                <div style={{ 
                  textAlign: 'center',
                  marginTop: '50px',
                  marginBottom: '50px'
                }}>
                  <p className="govuk-visually-hidden" role="status" aria-live="assertive" aria-atomic="true">
                    Generating invoice. Please do not navigate away from this page.
                  </p>
                  <div 
                    aria-hidden="true"
                    style={{
                      border: '8px solid #dee0e2',
                      borderTop: '8px solid #1d70b8',
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 30px auto'
                    }}
                  />
                  <p style={{ 
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'Arial, sans-serif',
                    color: '#0b0c0c'
                  }}>
                    Generating invoice...
                  </p>
                </div>
                
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </>
            )}

      </main>
    </div>
  );
};

export default InvoiceGenerationPage;