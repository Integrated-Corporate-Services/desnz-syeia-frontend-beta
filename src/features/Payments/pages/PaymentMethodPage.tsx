import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { createPayment } from '../../../services/govPayService';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { createLogger } from '../../../utils/logger';
import { trackPaymentEvent } from '../../../utils/analytics';
import PAYMENT_PAGE_TEXT from '../../../constants/paymentPage.constants';
import { getCardPaymentDescription } from '../../../constants/payment';
import PageTitle from '../../../components/PageTitle';

const logger = createLogger('PaymentMethodPage');

const PaymentMethodPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resolvedTotalAmount, setResolvedTotalAmount] = useState<number | null>(null);
  
  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;

  interface LocationState {
    invoiceNumber?: string;
    totalAmount?: number;
    consentFee?: number;
    eiaScreeningFee?: number;
  }

  const { invoiceNumber, totalAmount, consentFee, eiaScreeningFee } = (location.state || {}) as LocationState;

  const effectiveTotalAmount = useMemo(() => {
    if (typeof totalAmount === 'number' && !Number.isNaN(totalAmount) && totalAmount > 0) {
      return totalAmount;
    }

    if (
      typeof resolvedTotalAmount === 'number' &&
      !Number.isNaN(resolvedTotalAmount) &&
      resolvedTotalAmount > 0
    ) {
      return resolvedTotalAmount;
    }

    return null;
  }, [totalAmount, resolvedTotalAmount]);

  useEffect(() => {
    const loadFeesIfNeeded = async () => {
      if (!applicationId) {
        return;
      }

      if (typeof totalAmount === 'number' && !Number.isNaN(totalAmount) && totalAmount > 0) {
        setResolvedTotalAmount(totalAmount);
        return;
      }

      try {
        const response = await fetch(buildBackendUrl(`/api/invoice/${applicationId}/calculate-fees`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const result = await response.json();
        if (typeof result.totalAmount === 'number' && result.totalAmount > 0) {
          setResolvedTotalAmount(result.totalAmount);
        }
      } catch {
        // Keep page interactive; validation blocks payment if amount stays unavailable.
      }
    };

    loadFeesIfNeeded();
  }, [applicationId, totalAmount]);

const handlePayByCard = async () => {
  if (!effectiveTotalAmount) {
    setError('Payment amount is not available. Please return to pay and submit and try again.');
    return;
  }

  // Track pay by card button click
  trackPaymentEvent('pay_by_card_clicked', {
    page_path: location.pathname,
    application_id: applicationId,
    payment_amount: effectiveTotalAmount,
    invoice_number: invoiceNumber,
  });

  setLoading(true);
  setError('');

  try {
    // Store totalAmount in sessionStorage BEFORE navigating to GOV.UK Pay
    sessionStorage.setItem('totalAmount', effectiveTotalAmount.toString());

    const amountInPence = Math.round(effectiveTotalAmount * 100);
    const result = await createPayment(
      amountInPence,
      applicationId, // reference
      getCardPaymentDescription(applicationId, baseUrl === NWL_BASE_URL),
      `${window.location.origin}/payment/callback`, // return_url
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
      setError('No redirect URL received from payment service');
      setLoading(false);
    }
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    setLoading(false);
  }
};

  const handleBackToTaskList = () => {
    navigate(`${baseUrl}/${applicationId}/task-list`);
  };

  const handleBankTransfer = () => {
    if (invoiceNumber) {
      sessionStorage.setItem('invoiceNumber', invoiceNumber);
    }
    if (typeof effectiveTotalAmount === 'number') {
      sessionStorage.setItem('totalAmount', effectiveTotalAmount.toString());
    }
    navigate(`${baseUrl}/${applicationId}/bank-transfer-payment`, {
      state: { invoiceNumber, totalAmount: effectiveTotalAmount, consentFee, eiaScreeningFee }
    });
  };

  return (
    <>
            <PageTitle title="Choose payment method" />
            <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${baseUrl}/${applicationId}/task-list`}>
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
              <div className="govuk-error-summary govuk-!-width-two-thirds" role="alert" aria-labelledby="error-summary-title">
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

            <h1 className="govuk-heading-xl">{PAYMENT_PAGE_TEXT.pageTitle}</h1>

            <p className="govuk-body">
              You must pay <strong>£{effectiveTotalAmount?.toFixed(2) ?? '0.00'}</strong> to submit this application.
            </p>

            <p className="govuk-body">{PAYMENT_PAGE_TEXT.cardRedirect}</p>

            <p className="govuk-body">{PAYMENT_PAGE_TEXT.cardBenefits}</p>

            <details
              className="govuk-details govuk-!-margin-top-6"
              data-module="govuk-details"
            >
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  {PAYMENT_PAGE_TEXT.detailsSummary}
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  {PAYMENT_PAGE_TEXT.detailsParagraphs[0]}
                </p>
                <p className="govuk-body">
                  Your application&apos;s status will show as &apos;{PAYMENT_PAGE_TEXT.detailsStatus}&apos; until we have reconciled your payment.
                </p>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  onClick={handleBankTransfer}
                >
                  {PAYMENT_PAGE_TEXT.bankTransferButton}
                </button>
              </div>
            </details>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={handlePayByCard}
                disabled={loading}
                aria-busy={loading}
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
        </div>
          </div>
    </>
  );
};

export default PaymentMethodPage;