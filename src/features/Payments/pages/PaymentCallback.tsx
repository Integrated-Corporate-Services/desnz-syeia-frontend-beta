
import React, { useEffect, useState, useRef } from 'react';
import { getPaymentStatus } from '../../../services/govPayService';
import '../../../styles/govuk.scss';

export default function PaymentCallback() {
  const [status, setStatus] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Polling logic for payment status
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const paymentId = sessionStorage.getItem('paymentId');
    if (!paymentId) {
      setError('No payment ID found.');
      setLoading(false);
      return;
    }
    let attempts = 0;
    const maxAttempts = 60; // 3 seconds * 60 = 3 minutes
    const pollStatus = () => {
      setLoading(true);
      const paymentId = sessionStorage.getItem('paymentId');
      const applicationId = sessionStorage.getItem('applicationId');
      if (!paymentId || !applicationId) {
        setError('No payment ID found.');
        setLoading(false);
        return;
      }
      getPaymentStatus(applicationId, paymentId)
        .then(data => {
          setStatus(data.state?.status || '');
          setReference(data.reference || paymentId);
          setAmount(data.amount ? `£${(data.amount / 100).toFixed(2)}` : '');
          setDescription(data.description || '');
          if (["success", "failed", "cancelled"].includes(data.state?.status)) {
            // Final status, stop polling
            if (pollInterval.current) clearInterval(pollInterval.current);
            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
          if (pollInterval.current) clearInterval(pollInterval.current);
        });
      attempts++;
      if (attempts >= maxAttempts && pollInterval.current) {
        clearInterval(pollInterval.current);
        setError('Payment status polling timed out.');
        setLoading(false);
      }
    };
    pollStatus();
    pollInterval.current = setInterval(pollStatus, 3000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  return (
    <>
            <div className="govuk-width-container">
      <main className="govuk-main-wrapper govuk-!-padding-top-6" id="main-content">
        {loading ? (
          <div className="govuk-body">Loading payment status...</div>
        ) : error ? (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6" style={{ textAlign: 'center' }}>
              <h1 className="govuk-panel__title" style={{ fontSize: '2.5rem' }}>
                {status === 'success' ? 'Your payment was successful' : status === 'failed' ? 'Payment failed' : 'Payment status'}
              </h1>
              <div className="govuk-panel__body" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
                Your payment reference number is<br />
                <span style={{ fontWeight: 'bold', fontSize: '2rem' }}>{reference}</span>
              </div>
            </div>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Payment summary</h2>
            <table className="govuk-table govuk-!-margin-bottom-6" style={{ maxWidth: 500 }}>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">Payment for:</td>
                  <td className="govuk-table__cell" style={{ textAlign: 'right' }}>{description}</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">Total amount:</td>
                  <td className="govuk-table__cell" style={{ textAlign: 'right' }}>{amount}</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">Status:</td>
                  <td className="govuk-table__cell" style={{ textAlign: 'right' }}>{status}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button
                className="govuk-button govuk-button--secondary"
                type="button"
                onClick={() => {
                  const applicationId = sessionStorage.getItem('applicationId');
                  if (applicationId) {
                    window.location.href = `/task-list?id=${applicationId}`;
                  } else {
                    window.location.href = '/task-list';
                  }
                }}
              >
                Go to Applications
              </button>
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
}
