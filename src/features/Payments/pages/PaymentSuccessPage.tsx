import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  
  const { invoiceNumber, paymentId, reference } = location.state || {};

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">Application submitted</h1>
              <div className="govuk-panel__body">
                Your application number is<br />
                <strong>{reference || applicationId}</strong>
              </div>
            </div>

            <h2 className="govuk-heading-m">Payment Summary</h2>
            
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                {invoiceNumber && (
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Invoice Number</th>
                    <td className="govuk-table__cell">{invoiceNumber}</td>
                  </tr>
                )}
                {paymentId && (
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Payment ID</th>
                    <td className="govuk-table__cell">{paymentId}</td>
                  </tr>
                )}
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">Status</th>
                  <td className="govuk-table__cell">
                    <strong className="govuk-tag govuk-tag--green">Paid</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <h2 className="govuk-heading-m">What happens next</h2>
            <p className="govuk-body">
              You will receive an email to confirm your application has been submitted.
            </p>
            <p className="govuk-body">
              You can check your application's status in your account or in the email updates we send you.
            </p>

            <div className="govuk-button-group">
              <Link
                to="/workbasket"
                className="govuk-button"
              >
                Go to workbasket
              </Link>
              <Link
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
                className="govuk-button govuk-button--secondary"
              >
                View application
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;