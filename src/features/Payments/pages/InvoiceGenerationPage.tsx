import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';
import '../../../styles/loading-spinner.css'; // Import the spinner styles

const InvoiceGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get payment amounts from location state (passed from PaymentAmountPage)
  const { consentFee = 402.50, eiaScreeningFee = 60.00, totalAmount = 462.50 } = location.state || {};

  const handleGenerateInvoice = async () => {
    if (!applicationId) {
      setError('Application ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare invoice data
      const invoiceData = {
        userName: user?.full_name || 'User',
        userEmail: user?.email || '',
        consentFee: consentFee,
        eiaScreeningFee: eiaScreeningFee,
        totalAmount: totalAmount
      };

      // Call backend API with applicationId in URL
      const response = await fetch(
        `/backend/api/invoice/${applicationId}/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const result = await response.json();
      
      // Navigate to invoice download page
      navigate(`${S37_BASE_URL}/${applicationId}/invoice-download`, {
        state: {
          invoiceNumber: result.invoiceNumber,
          s3Key: result.s3Key,
          consentFee,
          eiaScreeningFee,
          totalAmount
        }
      });

    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice');
      setLoading(false);
    }
  };

  // Auto-generate invoice on page load
  useEffect(() => {
    if (applicationId) {
      handleGenerateInvoice();
    }
  }, [applicationId]);

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {loading && (
              <div className="hods-loading-spinner" role="status">
                <div className="hods-loading-spinner__spinner"></div>
                <div className="hods-loading-spinner__content">
                  <h1 className="govuk-heading-m">
                    Please wait while we generate your invoice...
                  </h1>
                </div>
              </div>
            )}

            {error && !loading && (
              <>
                <h1 className="govuk-heading-xl">Generating Invoice</h1>
                <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
                  <h2 className="govuk-error-summary__title" id="error-summary-title">
                    There is a problem
                  </h2>
                  <div className="govuk-error-summary__body">
                    <p>{error}</p>
                  </div>
                </div>
                <button
                  className="govuk-button"
                  onClick={() => navigate(`${S37_BASE_URL}/${applicationId}/pay-and-submit`)}
                >
                  Go back
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceGenerationPage;