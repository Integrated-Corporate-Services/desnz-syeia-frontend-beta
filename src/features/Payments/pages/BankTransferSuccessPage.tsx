import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { applicationApiService } from '../../../services/applicationApiService';

const BankTransferSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();

  const { invoiceNumber, totalAmount, desnz_ref: passedDesnzRef } = location.state || {};

  // State for fetched desnz_ref if not passed
  const [desnz_ref, setDesnzRef] = useState<string | undefined>(passedDesnzRef);
  const [loading, setLoading] = useState(!passedDesnzRef);
  const [error, setError] = useState<string | null>(null);

  // Fetch desnz_ref from backend if not provided in navigation state
  useEffect(() => {
    if (!passedDesnzRef && applicationId) {
      const fetchDesnzRef = async () => {
        try {
          setLoading(true);
          const data = await applicationApiService.fetchApplicationDetails(applicationId);
          setDesnzRef(data.desnz_ref || applicationId);
          setError(null);
        } catch (err) {
          console.error('Error fetching DESNZ reference:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch DESNZ reference');
          // Fallback to applicationId if fetch fails
          setDesnzRef(applicationId);
        } finally {
          setLoading(false);
        }
      };

      fetchDesnzRef();
    }
  }, [applicationId, passedDesnzRef]);

  const handleGoToSummary = () => {
    navigate(`${S37_BASE_URL}/${applicationId}/application-summary`);
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-s" style={{ marginBottom: '10px', fontSize: '24px' }}>
              Application status
            </h1>
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">Application submitted</h1>
              <div className="govuk-panel__body">
                Your application number is
                <br />
                <strong>{loading ? 'Loading...' : desnz_ref || 'N/A'}</strong>
              </div>
            </div>

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">Warning</h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <p className="govuk-body">
              This application has been submitted and can no longer be edited or deleted.
            </p>

            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-warning-text__assistive">Warning</span>
                Please note that
              </strong>
            </div>

            <ul className="govuk-list govuk-list--bullet">
              <li>Your application has been submitted</li>
              <li>Your payment has not been received yet</li>
            </ul>

            <p className="govuk-body">
              You still need to complete your payment by bank transfer.
            </p>

            <p className="govuk-body">
              We will start processing your application but we cannot deliver a decision until we
              receive your payment.
            </p>

            <h2 className="govuk-heading-m">What to do next</h2>

            <p className="govuk-body">
              If you haven't paid yet, you must make your payment into this bank account:
            </p>

            <div className="govuk-inset-text">
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Account name</dt>
                  <dd className="govuk-summary-list__value">
                    Department for Energy Security and Net Zero
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Sort code</dt>
                  <dd className="govuk-summary-list__value">60-70-80</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Account number</dt>
                  <dd className="govuk-summary-list__value">10033769</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Payment reference</dt>
                  <dd className="govuk-summary-list__value">
                    <strong>{invoiceNumber || 'N/A'}</strong>
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Amount</dt>
                  <dd className="govuk-summary-list__value">
                    <strong>£{totalAmount?.toFixed(2) || '0.00'}</strong>
                  </dd>
                </div>
              </dl>
            </div>

            <p className="govuk-body">
              <strong>You must use your invoice number as the payment reference</strong> to help us
              match your payment to this application.
            </p>

            <h2 className="govuk-heading-m">What happens next</h2>
            <p className="govuk-body">
              You will receive an email to confirm your application has been submitted.
            </p>
            <p className="govuk-body">
              Your Overhead Lines (Section 37) will contact you in due course with
              <br />
              any follow up actions.
            </p>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <Link
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
                className="govuk-button"
                data-module="govuk-button"
              >
                Back to applications
              </Link>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={handleGoToSummary}
              >
                Go to Application summary
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BankTransferSuccessPage;
