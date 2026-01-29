import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { createPayment } from '../../../services/govPayService';
import { getPresignedGetUrl } from '../../../services/s3ApiService';

const InvoiceDownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { invoiceNumber, s3Key, consentFee, eiaScreeningFee, totalAmount } = location.state || {};

  const handleDownloadInvoice = async () => {
    if (!invoiceNumber) {
      setError('Invoice number not available');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Use backend download endpoint with invoice number as query param
      const downloadUrl = `/backend/api/invoice/${applicationId}/download?invoiceNumber=${encodeURIComponent(invoiceNumber)}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to download invoice');
      setLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    // Navigate to payment method selection page
    navigate(`${S37_BASE_URL}/${applicationId}/payment-method`, {
      state: {
        invoiceNumber: invoiceNumber,
        totalAmount: totalAmount,
        consentFee: consentFee,
        eiaScreeningFee: eiaScreeningFee
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
              Download Invoice
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

            <h1 className="govuk-heading-l">Your Invoice</h1>
            {invoiceNumber && (
              <p className="govuk-body">
                Your invoice number is <strong>{invoiceNumber}</strong>.
              </p>
            )}

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                onClick={handleDownloadInvoice}
                disabled={loading || !s3Key}
              >
                {loading ? 'Downloading...' : 'Download Invoice'}
              </button>
            </div>
            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleContinueToPayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue to payment'}
              </button>
            </div>  
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceDownloadPage;