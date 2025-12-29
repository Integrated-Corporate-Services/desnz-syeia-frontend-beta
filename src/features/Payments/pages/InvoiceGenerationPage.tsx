import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';

const InvoiceGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get payment amounts from location state (passed from PaymentAmountPage)
  const { 
    consentFee = 0, 
    screeningFee = 0, 
    eiaFee = 0, 
    totalAmount = 0,
    breakdown = null 
  } = location.state || {};

  const handleGenerateInvoice = async () => {
    if (!applicationId) {
      setError('Application ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare invoice data with dynamic fees
      const invoiceData = {
        userName: user?.full_name || 'User',
        userEmail: user?.email || '',
        consentFee: consentFee,
        screeningFee: screeningFee,  
        eiaFee: eiaFee,              
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
          screeningFee,  
          eiaFee,        
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
    if (applicationId && totalAmount > 0) {
      handleGenerateInvoice();
    } else if (applicationId && totalAmount === 0) {
      setError('Payment amount is not available. Please go back and try again.');
      setLoading(false);
    }
  }, [applicationId]);

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {loading && (
              <>
                {/* Important Banner */}
                <div style={{ 
                  border: '5px solid #1d70b8',
                  marginBottom: '30px'
                }}>
                  <div style={{ 
                    backgroundColor: '#1d70b8',
                    padding: '10px 15px'
                  }}>
                    <h2 style={{ 
                      color: '#ffffff',
                      margin: 0,
                      fontSize: '19px',
                      fontWeight: 700,
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      Important
                    </h2>
                  </div>
                  <div style={{ 
                    backgroundColor: '#ffffff',
                    padding: '15px',
                    border: '1px solid #b1b4b6'
                  }}>
                    <p style={{ 
                      margin: 0,
                      fontSize: '19px',
                      lineHeight: '1.5',
                      fontFamily: 'Arial, sans-serif',
                      color: '#0b0c0c'
                    }}>
                      Please do not close this window or navigate away from this page while we generate your invoice.
                    </p>
                  </div>
                </div>

                {/* Loading Spinner and Text */}
                <div style={{ 
                  textAlign: 'center',
                  marginTop: '50px',
                  marginBottom: '50px'
                }}>
                  <div 
                    style={{
                      border: '8px solid #dee0e2',
                      borderTop: '8px solid #1d70b8',
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 30px auto'
                    }}
                  />
                  <p style={{ 
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'Arial, sans-serif',
                    color: '#0b0c0c'
                  }}>
                    Generating invoice...
                  </p>
                </div>
                
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </>
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