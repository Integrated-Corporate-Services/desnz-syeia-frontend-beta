import React, {useState, useEffect} from 'react';
import { useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { applicationApiService } from '../../../services/applicationApiService';
import { trackPaymentEvent, trackButtonClick } from '../../../utils/analytics';
import { BANK_TRANSFER_SUCCESS_PAGE } from '../../../constants/payment';

interface PaymentSuccessState {
  invoiceNumber?: string;
  paymentId?: string;
  reference?: string;
  desnz_ref?: string;
  totalAmount?: number;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const applicationId = useGetApplicationId();
  
  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;
  
  const {
    invoiceNumber,
    paymentId,
    reference,
    desnz_ref: passedDesnzRef,
    totalAmount,
  } = (location.state as PaymentSuccessState | null) || {};

  // State for fetched desnz_ref if not passed
  const [desnz_ref, setDesnzRef] = useState<string | undefined>(passedDesnzRef);
  const [loading, setLoading] = useState(!passedDesnzRef);
  const [error, setError] = useState<string | null>(null);

  // Track payment success page load
  useEffect(() => {
    trackPaymentEvent('payment_success_page_loaded', {
      page_path: location.pathname,
      application_id: applicationId,
      invoice_number: invoiceNumber,
      payment_id: paymentId,
      desnz_ref: passedDesnzRef,
      total_amount: totalAmount,
    });
  }, []);

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
    <>
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
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">Reference number</th>
                  <td className="govuk-table__cell">{reference || paymentId || 'N/A'}</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">Invoice number</th>
                  <td className="govuk-table__cell">{invoiceNumber || 'N/A'}</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">Total amount</th>
                  <td className="govuk-table__cell">
                    {typeof totalAmount === 'number' ? formatCurrency(totalAmount) : 'N/A'}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">Payment status</th>
                  <td className="govuk-table__cell">Paid</td>
                </tr>
              </tbody>
            </table>

            <h2 className="govuk-heading-m">What happens next</h2>
            <p className="govuk-body">
              You will receive an email to confirm your application has been submitted.
            </p>
            <p className="govuk-body">
              {baseUrl === NWL_BASE_URL
                ? BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO_NWL
                : BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO_S37}
            </p>

            <div className="govuk-button-group">
              <Link
                to={`${baseUrl}/${applicationId}/application-summary`}
                className="govuk-button govuk-button--secondary"
                onClick={() => {
                  trackButtonClick('View application summary', location.pathname, {
                    application_id: applicationId,
                    desnz_ref: desnz_ref,
                    payment_id: paymentId,
                  });
                }}
              >
                View application summary
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default PaymentSuccessPage;