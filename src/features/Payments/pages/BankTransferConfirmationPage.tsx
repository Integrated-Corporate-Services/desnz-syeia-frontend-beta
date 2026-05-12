import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { submitApplicationWithBankTransfer } from '../../../services/govPayService';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('BankTransferConfirmationPage');

const BankTransferConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [transactionNumber, setTransactionNumber] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { invoiceNumber, totalAmount } = location.state || {};

  const handleSubmit = async () => {
    // Validation
    if (!transactionNumber.trim()) {
      setError('You must provide the transaction number');
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView();
      }, 0);
      return;
    }

    if (!isChecked) {
      setError('You must confirm you have made the payment');
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView();
      }, 0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.info('Submitting application with bank transfer', {
        applicationId,
        invoiceNumber,
        transactionNumber
      });

      const result = await submitApplicationWithBankTransfer(
        applicationId,
        invoiceNumber,
        transactionNumber,
        totalAmount,
        user?.user_id
      );

      logger.info('Application submitted successfully:', result);

      // Navigate to success page
      navigate(`${S37_BASE_URL}/${applicationId}/bank-transfer-success`, {
        state: {
          invoiceNumber,
          totalAmount,
          desnz_ref: result.desnz_ref || result.desnzReference
        }
      });
    } catch (err: any) {
      logger.error('Failed to submit application:', err);
      setError(err.message || 'Failed to submit application');
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
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/payment-method`}>
                Pay and submit
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">
              Confirm your payment action
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
                      <a href="#transaction-number">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-xl">Confirm your payment action</h1>

            <p className="govuk-body">
              At this point, we expect you have completed the bank transfer.
            </p>

            <p className="govuk-body">
              Please provide the transaction number provided via bank transfer that you have completed for the payment of this application.
            </p>

            <div className={`govuk-form-group ${error && !transactionNumber.trim() ? 'govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--m" htmlFor="transaction-number">
                Transaction number
              </label>
              {error && !transactionNumber.trim() && (
                <p id="transaction-number-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {error}
                </p>
              )}
              <input
                className={`govuk-input ${error && !transactionNumber.trim() ? 'govuk-input--error' : ''}`}
                id="transaction-number"
                name="transaction-number"
                type="text"
                value={transactionNumber}
                onChange={(e) => {
                  setTransactionNumber(e.target.value);
                  setError('');
                }}
                aria-describedby={error && !transactionNumber.trim() ? 'transaction-number-error' : undefined}
              />
            </div>

            <div className={`govuk-form-group ${error && transactionNumber.trim() && !isChecked ? 'govuk-form-group--error' : ''}`}>
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
                        setError('');
                      }}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="confirm-payment">
                      I confirm I have made the payment with above details
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit application'}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={handleBackToTaskList}
                disabled={loading}
              >
                Back to task list
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BankTransferConfirmationPage;
