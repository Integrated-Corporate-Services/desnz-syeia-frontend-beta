import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const BankTransferSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();

  const { invoiceNumber, totalAmount, desnz_ref } = location.state || {};

  const handleBackToApplications = () => {
    navigate('/frontend/s-37');
  };

  const handleGoToSummary = () => {
    navigate(`${S37_BASE_URL}/${applicationId}/application-summary`);
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                Application submitted - Payment pending
              </h1>
              <div className="govuk-panel__body">
                Your application number is
                <br />
                <strong className="govuk-!-font-size-48">{desnz_ref || 'Pending'}</strong>
              </div>
            </div>

            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
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
              We will start processing your application but we cannot deliver a decision until we receive your payment.
            </p>

            <h2 className="govuk-heading-m">What to do next</h2>

            <p className="govuk-body">
              If you haven't paid yet, you must make your payment into this bank account:
            </p>

            <div className="govuk-inset-text">
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Account name</dt>
                  <dd className="govuk-summary-list__value">Department for Energy Security and Net Zero</dd>
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
                  <dd className="govuk-summary-list__value"><strong>{invoiceNumber || 'N/A'}</strong></dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Amount</dt>
                  <dd className="govuk-summary-list__value"><strong>£{totalAmount?.toFixed(2) || '0.00'}</strong></dd>
                </div>
              </dl>
            </div>

            <p className="govuk-body">
              <strong>You must use your invoice number as the payment reference</strong> to help us match your payment to this application.
            </p>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={handleBackToApplications}
              >
                Back to applications
              </button>
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
