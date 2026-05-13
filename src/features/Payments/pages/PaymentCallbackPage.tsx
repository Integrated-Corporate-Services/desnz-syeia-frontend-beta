import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';import { createLogger } from '../../../utils/logger';

const logger = createLogger('PaymentCallbackPage');import { S37_BASE_URL } from '../../../constants/s37';
import { applicationApiService } from '../../../services/applicationApiService';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment details from URL and session
        const paymentId = searchParams.get('paymentId') || sessionStorage.getItem('paymentId');
        const applicationId = sessionStorage.getItem('applicationId');
        const invoiceNumber = sessionStorage.getItem('invoiceNumber');
        const totalAmount = sessionStorage.getItem('totalAmount');

        logger.info('Payment callback - paymentId:', paymentId);
        logger.info('Payment callback - applicationId:', applicationId);

        if (!paymentId || !applicationId) {
          setStatus('failed');
          setErrorMessage('Missing payment or application information');
          return;
        }

        // Call backend to verify payment status
        const response = await fetch(`/backend/api/gov-pay/applications/${applicationId}/payments/${paymentId}/verify`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate(`${S37_BASE_URL}/${applicationId}/payment-success`, {
              state: {
                applicationId,
                invoiceNumber,
                paymentId,
                reference: data.reference,
                totalAmount: totalAmount ? parseFloat(totalAmount) : undefined
              }
            });
          }, 1000);

        } else if (paymentStatus === 'failed') {
          setStatus('failed');
          setErrorMessage('Your payment was not successful. Please try again.');
        } else if (paymentStatus === 'cancelled') {
          setStatus('cancelled');
          setErrorMessage('Payment was cancelled.');
        } else {
          setStatus('failed');
          setErrorMessage(`Unexpected payment status: ${paymentStatus}`);
        }
      } catch (error) {
        setStatus('failed');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to verify payment');
      }
      
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const handleTryAgain = () => {
    const applicationId = sessionStorage.getItem('applicationId');
    if (applicationId) {
      navigate(`${S37_BASE_URL}/${applicationId}/payment-method`);
    } else {
      navigate('/workbasket');
    }
  };

  const handleBackToTaskList = () => {
    const applicationId = sessionStorage.getItem('applicationId');
    if (applicationId) {
      navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
    } else {
      navigate('/workbasket');
    }
  };

  return (
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

            {status === 'failed' && (
              <>
                <h1 className="govuk-heading-l">Payment failed</h1>
                <div className="govuk-error-summary" role="alert">
                  <h2 className="govuk-error-summary__title">There was a problem</h2>
                  <div className="govuk-error-summary__body">
                    <p>{errorMessage || 'Your payment could not be processed.'}</p>
                  </div>
                </div>
                <p className="govuk-body">
                  Your application has not been submitted because the payment was not successful.
                </p>
                <div className="govuk-button-group">
                  <button
                    type="button"
                    className="govuk-button"
                    onClick={handleTryAgain}
                  >
                    Try payment again
                  </button>
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    onClick={handleBackToTaskList}
                  >
                    Back to task list
                  </button>
                </div>
              </>
            )}

            {status === 'cancelled' && (
              <>
                <h1 className="govuk-heading-l">Payment cancelled</h1>
                <p className="govuk-body">
                  You cancelled the payment. Your application has not been submitted.
                </p>
                <div className="govuk-button-group">
                  <button
                    type="button"
                    className="govuk-button"
                    onClick={handleTryAgain}
                  >
                    Try payment again
                  </button>
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    onClick={handleBackToTaskList}
                  >
                    Back to task list
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCallbackPage;