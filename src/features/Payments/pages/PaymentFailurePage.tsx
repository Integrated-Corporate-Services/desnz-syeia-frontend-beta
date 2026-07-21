import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { createPayment } from '../../../services/govPayService';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { createLogger } from '../../../utils/logger';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { getCardPaymentDescription } from '../../../constants/payment';
import SkipLink from '../../../components/SkipLink';

const logger = createLogger('PaymentFailurePage');

interface PaymentFailureLocationState {
  errorMessage?: string;
  showBanner?: boolean;
  paymentId?: string;
  invoiceNumber?: string;
  totalAmount?: number;
}

const PaymentFailurePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [retryError, setRetryError] = useState('');
  const [retryLoading, setRetryLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;
  const state = (location.state || {}) as PaymentFailureLocationState;

  const invoiceNumber = state.invoiceNumber || sessionStorage.getItem('invoiceNumber') || '';
  const paymentId = state.paymentId || sessionStorage.getItem('paymentId') || 'unknown';

  const resolvedTotalAmount = useMemo(() => {
    if (typeof state.totalAmount === 'number' && state.totalAmount > 0) {
      return state.totalAmount;
    }

    const storedAmount = sessionStorage.getItem('totalAmount');
    if (!storedAmount) {
      return null;
    }

    const parsedAmount = Number.parseFloat(storedAmount);
    return Number.isNaN(parsedAmount) || parsedAmount <= 0 ? null : parsedAmount;
  }, [state.totalAmount]);

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    const bannerStorageKey = `paymentFailureBannerShown:${applicationId}:${paymentId}`;
    const hasShownBanner = sessionStorage.getItem(bannerStorageKey) === 'true';

    if (state.showBanner && !hasShownBanner) {
      setShowBanner(true);
      sessionStorage.setItem(bannerStorageKey, 'true');
      return;
    }

    setShowBanner(false);
  }, [applicationId, paymentId, state.showBanner]);

  const resolveAmountForRetry = async () => {
    if (resolvedTotalAmount && resolvedTotalAmount > 0) {
      return resolvedTotalAmount;
    }

    if (!applicationId) {
      return null;
    }

    try {
      const response = await fetch(buildBackendUrl(`/api/invoice/${applicationId}/calculate-fees`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      if (typeof result.totalAmount === 'number' && result.totalAmount > 0) {
        sessionStorage.setItem('totalAmount', result.totalAmount.toString());
        return result.totalAmount;
      }
    } catch (error) {
      logger.warn('Failed to resolve payment amount for retry:', error);
    }

    return null;
  };

  const handleRetryPayment = async () => {
    if (!applicationId) {
      navigate('/workbasket');
      return;
    }

    setRetryError('');
    setRetryLoading(true);

    try {
      const totalAmount = await resolveAmountForRetry();
      if (!totalAmount) {
        throw new Error('Payment amount is not available. Please return to the application and try again.');
      }

      const amountInPence = Math.round(totalAmount * 100);
      const result = await createPayment(
        amountInPence,
        applicationId,
        getCardPaymentDescription(applicationId, baseUrl === NWL_BASE_URL),
        `${window.location.origin}/payment/callback`,
        {
          applicationId,
          invoiceNumber,
          userId: user?.user_id,
        }
      );

      if (result.result?.localId) {
        sessionStorage.setItem('paymentLocalId', result.result.localId.toString());
      }
      if (result.result?.payment_id) {
        sessionStorage.setItem('paymentId', result.result.payment_id);
      }
      sessionStorage.setItem('applicationId', applicationId);
      sessionStorage.setItem('totalAmount', totalAmount.toString());
      if (invoiceNumber) {
        sessionStorage.setItem('invoiceNumber', invoiceNumber);
      }

      const nextUrl = result.result?._links?.next_url?.href || result.result?.next_url;
      if (!nextUrl) {
        throw new Error('No redirect URL received from payment service');
      }

      window.location.href = nextUrl;
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : 'Failed to initiate payment');
      setRetryLoading(false);
    }
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
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
            <h1 className="govuk-visually-hidden">
              The payment was unsuccessful and your application has not been submitted.
            </h1>

            {showBanner && (
              <div
                role="region"
                aria-labelledby="payment-failure-banner-title"
                style={{
                  border: '3px solid #1d70b8',
                  marginBottom: '30px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#1d70b8',
                    padding: '10px 15px',
                  }}
                >
                  <h2
                    id="payment-failure-banner-title"
                    style={{
                      color: '#ffffff',
                      margin: 0,
                      fontSize: '19px',
                      fontWeight: 700,
                    }}
                  >
                    Important
                  </h2>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '15px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '36px',
                      lineHeight: '1.2',
                      fontWeight: 700,
                      color: '#0b0c0c',
                    }}
                  >
                    The payment was unsuccessful and your application has not been submitted.
                  </p>
                </div>
              </div>
            )}

            {retryError && (
              <div className="govuk-error-summary" role="alert" aria-labelledby="payment-retry-error-title">
                <h2 className="govuk-error-summary__title" id="payment-retry-error-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>{retryError}</li>
                  </ul>
                </div>
              </div>
            )}

            {!showBanner && (
              <h1 className="govuk-heading-l">
                The payment was unsuccessful and your application has not been submitted.
              </h1>
            )}

            <p className="govuk-body">No money has been taken from your account.</p>

            <p className="govuk-body">Payments can fail if:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>your card details were incorrect</li>
              <li>your card has expired</li>
              <li>your card type is not accepted</li>
              <li>your bank declined the payment</li>
              <li>there was a temporary problem with the payment service</li>
            </ul>

            <h2 className="govuk-heading-m">What happens next</h2>
            <p className="govuk-body">
              You can try to pay by card again or return to the application. Please contact your bank if the payment fails again.
            </p>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={handleRetryPayment}
                disabled={retryLoading}
              >
                {retryLoading ? 'Processing...' : 'Pay by card'}
              </button>
              <Link to={`${baseUrl}/${applicationId}/task-list`} className="govuk-button govuk-button--secondary">
                Return to application
              </Link>
            </div>

            {state.errorMessage && (
              <p className="govuk-body-s govuk-!-margin-top-3">{state.errorMessage}</p>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default PaymentFailurePage;