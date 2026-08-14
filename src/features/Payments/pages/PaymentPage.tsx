import React, { useState } from 'react';
import { createPayment } from '../../../services/govPayService';
import { useLocation } from 'react-router-dom';
import '../../../styles/govuk.scss';

export default function PaymentPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const applicationId = params.get('id') || '';
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('Test payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const returnUrl = `${window.location.origin}/payment/callback`;
      //const result = await createPayment(amount * 100, applicationId, description);
      const result = await createPayment((amount === '' ? 0 : amount) * 100, applicationId, description, returnUrl);
      // Store localId/paymentId in sessionStorage for callback/result page
      if (result.localId) {
        sessionStorage.setItem('paymentLocalId', result.localId);
      }
      if (result.payment_id) {
        sessionStorage.setItem('paymentId', result.payment_id);
      }
      // Redirect to GOV.UK Pay
      if (result.next_url) {
        window.location.href = result.next_url;
      } else if (result._links && result._links.next_url && result._links.next_url.href) {
        window.location.href = result._links.next_url.href;
      } else {
        setError('No redirect URL received from payment API');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
            <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <h1 className="govuk-heading-l">Make a payment</h1>
        {error && (
          <div className="govuk-error-summary govuk-!-margin-bottom-6" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
            <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p>{error}</p>
            </div>
          </div>
        )}
        <form className="govuk-form-group" onSubmit={e => { e.preventDefault(); handlePay(); }} noValidate>
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m govuk-!-margin-bottom-4">Payment details</legend>
            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label">Reference</label>
              <div className="govuk-!-margin-top-1 govuk-!-margin-bottom-2 govuk-!-font-weight-bold govuk-!-width-one-quarter" style={{ wordBreak: 'break-all', background: '#f3f2f1', padding: '8px', borderRadius: '4px', border: '1px solid #b1b4b6' }}>
                {applicationId}
              </div>
            </div>
            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label" htmlFor="amount">Amount</label>
              <div style={{ display: 'block' }}>
                <input
                  className="govuk-input govuk-!-width-one-quarter"
                  id="amount"
                  name="amount"
                  type="number"
                  aria-describedby="amount-hint"
                  value={amount}
                    onChange={e => {
                      const val = e.target.value;
                      setAmount(val === '' ? '' : Number(val));
                    }}
                  onBlur={e => { if (Number(e.target.value) < 1) setAmount(1); }}
                  min={1}
                  required
                />
              </div>
            </div>
            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label" htmlFor="description">Description</label>
              <span className="govuk-hint" id="description-hint">Describe what this payment is for</span>
              <div style={{ display: 'block' }}>
                <input
                  className="govuk-input govuk-!-width-one-quarter"
                  id="description"
                  name="description"
                  type="text"
                  aria-describedby="description-hint"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            data-govuk-button-init=""
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Processing...' : 'Continue to payment'}
          </button>
        </form>
      </main>
    </div>
    </>
  );
}
