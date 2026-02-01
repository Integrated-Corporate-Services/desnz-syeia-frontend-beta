import React, {useState, useEffect} from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  
  const { invoiceNumber, paymentId, reference, desnz_ref: passedDesnzRef} = location.state || {};

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
          const response = await fetch(`/backend/api/applications/${applicationId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch DESNZ reference: ${response.statusText}`);
          }

          const data = await response.json();
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

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">Application submitted</h1>
              <div className="govuk-panel__body">
                Your application number is<br />
                <strong>
                  {loading ? 'Loading...' : desnz_ref || 'N/A'}
                </strong>
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

            <h2 className="govuk-heading-m">Payment Summary</h2>
            
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                {paymentId && (
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Payment reference number</th>
                    <td className="govuk-table__cell">{paymentId}</td>
                  </tr>
                )}
                {invoiceNumber && (
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Payment for</th>
                    <td className="govuk-table__cell">{invoiceNumber}</td>
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