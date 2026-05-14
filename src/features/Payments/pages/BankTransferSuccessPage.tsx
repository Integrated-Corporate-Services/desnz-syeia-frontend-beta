import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { BANK_DETAILS, BANK_TRANSFER_SUCCESS_PAGE, PAYMENT_BUTTON_LABELS, formatCurrency } from '../../../constants/payment';
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
              {BANK_TRANSFER_SUCCESS_PAGE.PAGE_HEADING}
            </h1>
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">{BANK_TRANSFER_SUCCESS_PAGE.PANEL_TITLE}</h1>
              <div className="govuk-panel__body">
                {BANK_TRANSFER_SUCCESS_PAGE.APPLICATION_NUMBER_TEXT}
                <br />
                <strong>{loading ? BANK_TRANSFER_SUCCESS_PAGE.LOADING_TEXT : desnz_ref || BANK_TRANSFER_SUCCESS_PAGE.NOT_AVAILABLE_TEXT}</strong>
              </div>
            </div>

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">{BANK_TRANSFER_SUCCESS_PAGE.ERROR_HEADING}</h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <p className="govuk-body">
              {BANK_TRANSFER_SUCCESS_PAGE.SUBMISSION_CONFIRMATION}
            </p>

            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-warning-text__assistive">{BANK_TRANSFER_SUCCESS_PAGE.ERROR_HEADING}</span>
                {BANK_TRANSFER_SUCCESS_PAGE.WARNING_HEADING}
              </strong>
            </div>

            <ul className="govuk-list govuk-list--bullet">
              <li>{BANK_TRANSFER_SUCCESS_PAGE.WARNING_ITEMS.APPLICATION_SUBMITTED}</li>
              <li>{BANK_TRANSFER_SUCCESS_PAGE.WARNING_ITEMS.PAYMENT_NOT_RECEIVED}</li>
            </ul>

            <p className="govuk-body">
              {BANK_TRANSFER_SUCCESS_PAGE.PAYMENT_REQUIRED}
            </p>

            <p className="govuk-body">
              {BANK_TRANSFER_SUCCESS_PAGE.PROCESSING_INFO}
            </p>

            <h2 className="govuk-heading-m">{BANK_TRANSFER_SUCCESS_PAGE.WHAT_TO_DO_NEXT_HEADING}</h2>

            <p className="govuk-body">
              {BANK_TRANSFER_SUCCESS_PAGE.PAYMENT_INSTRUCTION}
            </p>

            <div className="govuk-inset-text">
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">{BANK_TRANSFER_SUCCESS_PAGE.BANK_DETAILS_LABELS.ACCOUNT_NAME}</dt>
                  <dd className="govuk-summary-list__value">
                    {BANK_DETAILS.ACCOUNT_NAME}
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">{BANK_TRANSFER_SUCCESS_PAGE.BANK_DETAILS_LABELS.SORT_CODE}</dt>
                  <dd className="govuk-summary-list__value">{BANK_DETAILS.SORT_CODE}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">{BANK_TRANSFER_SUCCESS_PAGE.BANK_DETAILS_LABELS.ACCOUNT_NUMBER}</dt>
                  <dd className="govuk-summary-list__value">{BANK_DETAILS.ACCOUNT_NUMBER}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">{BANK_TRANSFER_SUCCESS_PAGE.BANK_DETAILS_LABELS.PAYMENT_REFERENCE}</dt>
                  <dd className="govuk-summary-list__value">
                    <strong>{invoiceNumber || BANK_TRANSFER_SUCCESS_PAGE.NOT_AVAILABLE_TEXT}</strong>
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">{BANK_TRANSFER_SUCCESS_PAGE.BANK_DETAILS_LABELS.AMOUNT}</dt>
                  <dd className="govuk-summary-list__value">
                    <strong>{totalAmount ? formatCurrency(totalAmount) : formatCurrency(0)}</strong>
                  </dd>
                </div>
              </dl>
            </div>

            <p className="govuk-body">
              <strong>{BANK_TRANSFER_SUCCESS_PAGE.PAYMENT_REFERENCE_INSTRUCTION}</strong> {BANK_TRANSFER_SUCCESS_PAGE.PAYMENT_REFERENCE_HELP}
            </p>

            <h2 className="govuk-heading-m">{BANK_TRANSFER_SUCCESS_PAGE.WHAT_HAPPENS_NEXT_HEADING}</h2>
            <p className="govuk-body">
              {BANK_TRANSFER_SUCCESS_PAGE.EMAIL_CONFIRMATION}
            </p>
            <p className="govuk-body">
              {BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO}
              <br />
              {BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_ACTIONS}
            </p>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <Link
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
                className="govuk-button"
                data-module="govuk-button"
              >
                {PAYMENT_BUTTON_LABELS.BACK_TO_APPLICATIONS}
              </Link>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={handleGoToSummary}
              >
                {PAYMENT_BUTTON_LABELS.GO_TO_SUMMARY}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BankTransferSuccessPage;
