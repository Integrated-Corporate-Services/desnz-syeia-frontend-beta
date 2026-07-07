import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { useAssets } from '../../../hooks/useAssets';
import SkipLink from '../../../components/SkipLink';

const PaymentAmountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { assets } = useAssets();
  
  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;

  // Dynamic payment breakdown - fetched from backend
  const [consentFee, setConsentFee] = useState(0);
  const [screeningFee, setScreeningFee] = useState(0);
  const [eiaFee, setEiaFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);

  // useEffect(() => {
  //   // Check if asset information is completed
  //   if (!assets || assets.length === 0) {
  //     alert('Please complete Asset information section first');
  //     navigate(`/s37/${applicationId}/task-list`);
  //   }
  // }, [assets, applicationId, navigate]);

  // Fetch payment fees from backend
  useEffect(() => {
    const fetchPaymentFees = async () => {
      if (!applicationId) {
        setError('Application ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // If an invoice already exists, skip generation step and go to invoice page.
        const statusResponse = await fetch(buildBackendUrl(`/backend/api/invoice/${applicationId}/status`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();
          if (statusResult.invoiceExists) {
            navigate(`${baseUrl}/${applicationId}/invoice-download`, {
              state: {
                invoiceNumber: statusResult.invoiceNumber,
                s3Key: statusResult.s3Key,
                consentFee: 0,
                eiaScreeningFee: 0,
                totalAmount: 0,
              },
              replace: true,
            });
            return;
          }
        }

        // Call backend API to calculate fees
        const response = await fetch(buildBackendUrl(`/backend/api/invoice/${applicationId}/calculate-fees`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch payment fees');
        }

        const result = await response.json();
        
        // Set the fee amounts from the backend response
        setConsentFee(result.nominalFee || 0);
        setScreeningFee(result.screeningFee || 0);
        setEiaFee(result.eiaFee || 0);
        setTotalAmount(result.totalAmount || 0);
        setFeeBreakdown(result.breakdown || null);

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payment fees');
        setLoading(false);
      }
    };

    fetchPaymentFees();
  }, [applicationId, baseUrl, navigate]);

  const handleGenerateInvoice = async () => {
    navigate(`${baseUrl}/${applicationId}/generate-invoice`, {
      state: {
        consentFee,
        screeningFee,
        eiaFee,
        totalAmount,
        breakdown: feeBreakdown
      }
    });
  };

  if (loading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">Loading payment information...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${baseUrl}/${applicationId}/task-list`}>
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            Payment Amount
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <div className="govuk-error-summary govuk-!-width-two-thirds" role="alert" aria-labelledby="error-summary-title">
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-l">
              Payment required
            </h1>

            <p className="govuk-body">
              You must pay <strong>£{totalAmount.toFixed(2)}</strong> to submit this application.
            </p>
            <p className="govuk-body">
              Here is the breakdown of your payment:
            </p>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Item</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Amount</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {/* Base consent fee */}
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell"><strong>
                    {feeBreakdown?.baseDescription || (baseUrl === NWL_BASE_URL ? 'Application for a necessary wayleave' : 'Overhead Lines (Section 37): Consent Application')}
                  </strong></td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">£{consentFee.toFixed(2)}</td>
                </tr>
                
                {/* Screening fee - only show if applicable */}
                {screeningFee > 0 && !eiaFee && (
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell"><strong>
                      {feeBreakdown?.screeningDescription || 'Overhead Lines (Section 37): EIA Screening'}
                      </strong>
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">£{screeningFee.toFixed(2)}</td>
                  </tr>
                )}

                {/* Full EIA fee - only show if applicable */}
                {eiaFee > 0 && (
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell"><strong>
                      {feeBreakdown?.eiaDescription || 'Overhead Lines (Section 37): Full EIA Process with Environmental Statement'}
                    </strong></td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">£{eiaFee.toFixed(2)}</td>
                  </tr>
                )}

                {/* Total */}
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell"><strong>TOTAL</strong></td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">£{totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Invoice Generation Notice - NEW */}
            <div className="govuk-inset-text" style={{
              borderLeftColor: '#1d70b8',
              paddingLeft: '15px'
            }}>
              You need to generate an invoice to move to the next step.
            </div>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                onClick={handleGenerateInvoice}
                disabled={loading || error !== ''}
              >
                Generate Invoice
              </button>
              <Link
                to={`${baseUrl}/${applicationId}/task-list`}
                className="govuk-button govuk-button--secondary"
              >
                Back to task list
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default PaymentAmountPage;