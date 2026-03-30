import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { createPayment } from '../../../services/govPayService';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('PaymentMethodPage');

const PaymentMethodPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBankTransfer, setShowBankTransfer] = useState(false);

  const { invoiceNumber, totalAmount, consentFee, eiaScreeningFee } = location.state || {};

const handlePayByCard = async () => {
  if (!isChecked) {
    setError('You must confirm that you understand the application will be submitted when you pay by card');
    setTimeout(() => {
      const errorSummary = document.querySelector('.govuk-error-summary');
      if (errorSummary) errorSummary.scrollIntoView({  });
    }, 0);
    return;
  }

  setLoading(true);
  setError('');

  try {
    console.log('Creating payment with:', {
      amount: totalAmount,
      applicationId,
      userId: user?.user_id
    });

    // Store totalAmount in sessionStorage BEFORE navigating to GOV.UK Pay
    sessionStorage.setItem('totalAmount', totalAmount.toString());

    const result = await createPayment(
      Math.round(totalAmount * 100), // Convert to pence
      applicationId, // reference
      `Section 37 Application Payment - ${applicationId}`, // description
      `${window.location.origin}/frontend/payment/callback`, // return_url
      { // metadata
        applicationId,
        invoiceNumber,
        userId: user?.user_id
      }
    );

    logger.info('Payment creation result:', result);

    // Store payment details in sessionStorage
    if (result.result?.localId) {
      sessionStorage.setItem('paymentLocalId', result.result.localId.toString());
    }
    if (result.result?.payment_id) {
      sessionStorage.setItem('paymentId', result.result.payment_id);
    }
    sessionStorage.setItem('applicationId', applicationId);
    if (invoiceNumber) {
      sessionStorage.setItem('invoiceNumber', invoiceNumber);
    }

    // Redirect to GOV.UK Pay
    const nextUrl = result.result?._links?.next_url?.href || result.result?.next_url;
    
    if (nextUrl) {
      logger.info('Redirecting to GOV.UK Pay:', nextUrl);
      window.location.href = nextUrl;
    } else {
      console.error('No redirect URL in response:', result);
      setError('No redirect URL received from payment service');
      setLoading(false);
    }
  } catch (err: any) {
    console.error('Payment error:', err);
    setError(err.message || 'Failed to initiate payment');
    setLoading(false);
  }
};

  const handleBackToTaskList = () => {
    navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">
              Pay and submit
            </li>
          </ol>
        </nav>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>
                      <a href="#confirm-payment">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-xl">Choose payment method</h1>

            <p className="govuk-body">
              You must pay <strong>£{totalAmount?.toFixed(2) || '0.00'}</strong> to submit your application.
            </p>

            <p className="govuk-body">
              You will be redirected to a secure page to pay by credit or debit card.
            </p>

            <p className="govuk-body">
              This is the fastest way to pay and helps avoid any delays when processing your application.
            </p>

            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
              <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="confirm-payment"
                      name="confirm-payment"
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setIsChecked(e.target.checked);
                        setError(''); // Clear error when user checks the box
                      }}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="confirm-payment">
                      I understand this application will be submitted automatically when I pay by card.
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handlePayByCard}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay by card'}
            </button>

            <details
              className="govuk-details govuk-!-margin-top-6"
              data-module="govuk-details"
            >
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  I cannot pay by card and need another way to pay
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  If you cannot pay by credit or debit card, you can pay by bank transfer (BACS).
                </p>
                <p className="govuk-body">
                  We can only start processing your submitted application after we receive your payment.
                </p>
                <p className="govuk-body">
                  If you choose this payment method, the date of payment will become your official submission date.
                </p>
                <p className="govuk-body">
                  Your application's status will show as 'Payment pending' until we have reconciled your payment.
                </p>
                <p className="govuk-body">
                  You should pay by credit or debit card if you would like us to start processing your application more quickly.
                </p>
                <div className="govuk-button-group">
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button"
                    onClick={handleBackToTaskList}
                  >
                    Pay by bank transfer
                  </button>
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button"
                    onClick={handleBackToTaskList}
                  >
                    Back to the task list
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentMethodPage;