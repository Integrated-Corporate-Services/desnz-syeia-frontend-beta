import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';

const PaymentAmountPage: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment breakdown (these values should come from your application data/EIA fees)
  const consentFee = 402.50; // £402.50
  const eiaScreeningFee = 60.00; // £60.00
  const totalAmount = consentFee + eiaScreeningFee; // £462.50

  const handleGenerateInvoice = async () => {
    // Navigate to invoice generation page
    navigate(`${S37_BASE_URL}/${applicationId}/generate-invoice`, {
      state: {
        consentFee,
        eiaScreeningFee,
        totalAmount
      }
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
            <li className="govuk-breadcrumbs__list-item" aria-current="true">
              Page
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
                  <p>{error}</p>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-l">
              <span style={{ backgroundColor: '#ffdd00', padding: '0 4px' }}>Payment</span> Amount
            </h1>

            <p className="govuk-body">
              You need to pay <strong>£{totalAmount.toFixed(2)}</strong> to submit your application.
            </p>

            <p className="govuk-body">
              Once you generate the invoice, you will be redirected to a secure page to make the payment.
            </p>

            <p className="govuk-body">
              Here is the breakdown of your payment amount:
            </p>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Item</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Amount</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    Overhead Lines (Section 37):<br />
                    Consent Application for a line of 132kV or less
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{consentFee.toFixed(2)}</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    Overhead Lines (Section 37):<br />
                    Request for Consent Application<br />
                    EIA Screening
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{eiaScreeningFee.toFixed(2)}</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell"><strong>TOTAL</strong></td>
                  <td className="govuk-table__cell govuk-table__cell--numeric"><strong>{totalAmount.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                onClick={handleGenerateInvoice}
                disabled={loading}
              >
                Generate Invoice
              </button>
              <Link
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
                className="govuk-button govuk-button--secondary"
              >
                Back to task list
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentAmountPage;