import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { PAYMENT_PAGE_TITLES } from '../../../constants/payment';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const BankTransferPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('');

  const { invoiceNumber, totalAmount } = location.state || {};

  const handleContinue = () => {
    if (!isChecked) {
      setError('You must confirm you want to pay by bank transfer');
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView();
      }, 0);
      return;
    }

    // Navigate to confirmation page
    navigate(`${S37_BASE_URL}/${applicationId}/bank-transfer-confirmation`, {
      state: { invoiceNumber, totalAmount }
    });
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
              Pay by bank transfer
            </li>
          </ol>
        </nav>

        <h1 className="govuk-heading-xl">{PAYMENT_PAGE_TITLES.BANK_TRANSFER_PAYMENT}</h1>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            <p className="govuk-body">You must make your payment using these banking details:</p>

            <dl className="govuk-summary-list govuk-!-margin-bottom-3">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Account name</dt>
                <dd className="govuk-summary-list__value">Department for Energy Security and Net Zero</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Sort Code</dt>
                <dd className="govuk-summary-list__value">60-70-80</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Account Number</dt>
                <dd className="govuk-summary-list__value">10033769</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Payment reference</dt>
                <dd className="govuk-summary-list__value">{invoiceNumber || '[invoice number]'}</dd>
              </div>
            </dl>

            <div className="govuk-inset-text govuk-!-margin-bottom-3">
              <p className="govuk-body">You must use your invoice number as the payment reference to help us match your payment to this application.</p>
            </div>
            

            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
              <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="confirm-bank-transfer"
                      name="confirm-bank-transfer"
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setIsChecked(e.target.checked);
                        setError('');
                      }}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="confirm-bank-transfer">
                      I confirm I want to pay by bank transfer
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
                onClick={handleContinue}
              >
                Save and continue
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={handleBackToTaskList}
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

export default BankTransferPaymentPage;
