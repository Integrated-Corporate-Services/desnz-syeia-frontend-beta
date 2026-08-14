import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createLogger } from '../../../utils/logger';
import { buildBackendUrl } from '../../../utils/apiConfig';

const logger = createLogger('PaymentCallbackPage');

import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { applicationApiService } from '../../../services/applicationApiService';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [baseUrl, setBaseUrl] = useState(S37_BASE_URL);

  useEffect(() => {
    const verifyPayment = async () => {
      let detectedBaseUrl = S37_BASE_URL; // Default to S37
      
      try {
        // Get payment details from URL and session
        const paymentId = searchParams.get('paymentId') || sessionStorage.getItem('paymentId');
        const applicationId = sessionStorage.getItem('applicationId');
        const invoiceNumber = sessionStorage.getItem('invoiceNumber');
        const totalAmount = sessionStorage.getItem('totalAmount');

        logger.info('Payment callback - paymentId:', paymentId);
        logger.info('Payment callback - applicationId:', applicationId);

        if (!paymentId || !applicationId) {
          navigate('/workbasket', { replace: true });
          return;
        }

        // Fetch application type to determine correct base URL
        try {
          const appDetails = await applicationApiService.fetchApplicationDetails(applicationId);
          const applicationType = appDetails.type;
          detectedBaseUrl = applicationType === 'NWL' ? NWL_BASE_URL : S37_BASE_URL;
          setBaseUrl(detectedBaseUrl); // Update state for error handlers
          logger.info('Application type detected:', applicationType, 'baseUrl:', detectedBaseUrl);
        } catch (err) {
          logger.warn('Failed to fetch application type, defaulting to S37:', err);
        }

        // Call backend to verify payment status
        const response = await fetch(buildBackendUrl(`/api/gov-pay/applications/${applicationId}/payments/${paymentId}/verify`), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to verify payment: ${response.statusText}`);
      }

        const data = await response.json();
        logger.info('Payment verification response:', data);

        // Check GOV.UK Pay status
        const paymentStatus = data.state?.status;

        if (paymentStatus === 'success' || paymentStatus === 'submitted') {
          setStatus('success');

          // Clear session storage
          sessionStorage.removeItem('paymentId');
          sessionStorage.removeItem('paymentLocalId');
          sessionStorage.removeItem('invoiceNumber');
          sessionStorage.removeItem('totalAmount');
          
          // Redirect to success page after 1 second using detected baseUrl
          setTimeout(() => {
            navigate(`${detectedBaseUrl}/${applicationId}/payment-success`, {
              state: {
                applicationId,
                invoiceNumber,
                paymentId,
                reference: data.reference,
                totalAmount: totalAmount ? parseFloat(totalAmount) : undefined
              }
            });
          }, 1000);

        } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
          navigate(`${detectedBaseUrl}/${applicationId}/payment-failed`, {
            replace: true,
            state: {
              showBanner: true,
              errorMessage:
                paymentStatus === 'cancelled'
                  ? 'Payment was cancelled.'
                  : 'Your payment was not successful. Please try again.',
              paymentId,
              invoiceNumber,
              totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
            },
          });
        } else {
          navigate(`${detectedBaseUrl}/${applicationId}/payment-failed`, {
            replace: true,
            state: {
              showBanner: true,
              errorMessage: `Unexpected payment status: ${paymentStatus}`,
              paymentId,
              invoiceNumber,
              totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
            },
          });
        }
      } catch (error) {
        const applicationId = sessionStorage.getItem('applicationId');
        const invoiceNumber = sessionStorage.getItem('invoiceNumber') || undefined;
        const totalAmount = sessionStorage.getItem('totalAmount');
        const paymentId = sessionStorage.getItem('paymentId') || undefined;

        if (applicationId) {
          navigate(`${baseUrl}/${applicationId}/payment-failed`, {
            replace: true,
            state: {
              showBanner: true,
              errorMessage: error instanceof Error ? error.message : 'Failed to verify payment',
              paymentId,
              invoiceNumber,
              totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
            },
          });
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Failed to verify payment');
      }
      
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <>
            <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {status === 'loading' && (
              <>
                <h1 className="govuk-heading-l">Processing payment...</h1>
                <p className="govuk-body">Please wait while we confirm your payment.</p>
                <div className="govuk-!-margin-top-6">
                  <div className="spinner" style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #1d70b8',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </>
            )}

            {status === 'success' && (
              <div className="govuk-panel govuk-panel--confirmation">
                <h1 className="govuk-panel__title">Payment successful</h1>
                <div className="govuk-panel__body">
                  Your payment has been processed<br />
                  <strong>Redirecting to application submitted page...</strong>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="govuk-error-summary" role="alert" aria-labelledby="payment-callback-error-title">
                <h2 className="govuk-error-summary__title" id="payment-callback-error-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default PaymentCallbackPage;