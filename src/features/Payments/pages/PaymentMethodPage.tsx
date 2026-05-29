import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { createPayment } from '../../../services/govPayService';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { createLogger } from '../../../utils/logger';
import PAYMENT_PAGE_TEXT from '../../../constants/paymentPage.constants';

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

  interface LocationState {
    invoiceNumber?: string;
    totalAmount?: number;
    consentFee?: number;
    eiaScreeningFee?: number;
  }

  const { invoiceNumber, totalAmount, consentFee, eiaScreeningFee } = (location.state || {}) as LocationState;

const handlePayByCard = async () => {
  setLoading(true);
  setError('');

  try {
    console.log('Creating payment with:', {
      amount: totalAmount,
      applicationId,
      userId: user?.user_id
    });

    // Store totalAmount in sessionStorage BEFORE navigating to GOV.UK Pay
    sessionStorage.setItem('totalAmount', String(totalAmount ?? 0));

    const amountInPence = Math.round((totalAmount ?? 0) * 100); // Convert to pence, default 0
    const result = await createPayment(
      amountInPence,
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

  const handleBankTransfer = () => {
    navigate(`${S37_BASE_URL}/${applicationId}/bank-transfer-payment`, {
      state: { invoiceNumber, totalAmount, consentFee, eiaScreeningFee }
    });
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
                    <li>{error}</li>
                  </ul>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-l">{PAYMENT_PAGE_TEXT.pageTitle}</h1>

            <p className="govuk-body">
              {PAYMENT_PAGE_TEXT.intro((totalAmount?.toFixed(2) ?? '0.00'))}
            </p>

            <p className="govuk-body">{PAYMENT_PAGE_TEXT.cardRedirect}</p>

            <p className="govuk-body">{PAYMENT_PAGE_TEXT.cardBenefits}</p>

            {/* Confirmation checkbox intentionally removed per design (direct CTA) */}

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
                  Your application's status will show as '{PAYMENT_PAGE_TEXT.detailsStatus}' until we have reconciled your payment.
                </p>
                <p className="govuk-body">
                  You should pay by credit or debit card if you would like us to start processing your application more quickly.
                </p>
                <div className="govuk-button-group">
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button"
                    onClick={handleBankTransfer}
                  >
                    {PAYMENT_PAGE_TEXT.bankTransferButton}
                  </button>
                </div>

                <div className="govuk-!-margin-top-6 govuk-button-group">
                  <button
                    type="button"
                    className="govuk-button"
                    data-module="govuk-button"
                    onClick={handlePayByCard}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : PAYMENT_PAGE_TEXT.payByCardButton}
                  </button>
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button"
                    onClick={handleBackToTaskList}
                  >
                    {PAYMENT_PAGE_TEXT.backToTaskList}
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