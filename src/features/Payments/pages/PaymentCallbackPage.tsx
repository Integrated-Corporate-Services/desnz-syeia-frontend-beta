import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const applicationId = sessionStorage.getItem('applicationId');

    if (!paymentId || !applicationId) {
      setStatus('failed');
      return;
    }

    // Call backend to verify payment status
    fetch(`/backend/api/payments/${paymentId}/status`)
      .then(res => res.json())
      .then(data => {
        if (data.state?.status === 'success') {
          setStatus('success');
          setTimeout(() => {
            navigate(`${S37_BASE_URL}/${applicationId}/application-submitted`);
          }, 2000);
        } else {
          setStatus('failed');
        }
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [searchParams, navigate]);

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {status === 'loading' && (
              <>
                <h1 className="govuk-heading-l">Processing payment...</h1>
                <p className="govuk-body">Please wait while we confirm your payment.</p>
              </>
            )}
            {status === 'success' && (
              <div className="govuk-panel govuk-panel--confirmation">
                <h1 className="govuk-panel__title">Payment successful</h1>
                <div className="govuk-panel__body">
                  Your application has been submitted
                </div>
              </div>
            )}
            {status === 'failed' && (
              <>
                <h1 className="govuk-heading-l">Payment failed</h1>
                <p className="govuk-body">There was a problem processing your payment.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCallbackPage;