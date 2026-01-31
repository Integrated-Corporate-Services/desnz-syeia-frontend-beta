import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';

const PaymentAmountPage: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dynamic payment breakdown - fetched from backend
  const [consentFee, setConsentFee] = useState(0);
  const [screeningFee, setScreeningFee] = useState(0);
  const [eiaFee, setEiaFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);

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

        // Call backend API to calculate fees
        const response = await fetch(`/backend/api/invoice/${applicationId}/calculate-fees`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
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
  }, [applicationId]);

  const handleGenerateInvoice = async () => {
    // Navigate to invoice generation page with dynamic fees
    navigate(`${S37_BASE_URL}/${applicationId}/generate-invoice`, {
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
        <main className="govuk-main-wrapper" id="main-content">
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
              Payment Amount
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
              Payment Amount
            </h1>

            <p className="govuk-body">
              You need to pay <strong>£{totalAmount.toFixed(2)}</strong> to submit your application.
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
                {/* Base consent fee */}
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    {feeBreakdown?.baseDescription || 'Overhead Lines (Section 37): Consent Application'}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">£{consentFee.toFixed(2)}</td>
                </tr>
                
                {/* Screening fee - only show if applicable */}
                {screeningFee > 0 && !eiaFee && (
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell">
                      {feeBreakdown?.screeningDescription || 'Overhead Lines (Section 37): EIA Screening'}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">£{screeningFee.toFixed(2)}</td>
                  </tr>
                )}

                {/* Full EIA fee - only show if applicable */}
                {eiaFee > 0 && (
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell">
                      {feeBreakdown?.eiaDescription || 'Overhead Lines (Section 37): Full EIA Process with Environmental Statement'}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">£{eiaFee.toFixed(2)}</td>
                  </tr>
                )}

                {/* Total */}
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell"><strong>TOTAL</strong></td>
                  <td className="govuk-table__cell govuk-table__cell--numeric"><strong>£{totalAmount.toFixed(2)}</strong></td>
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

            {/* TODO
            {feeBreakdown && (
              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    View fee calculation details
                  </span>
                </summary>
                <div className="govuk-details__text">
                  <ul className="govuk-list govuk-list--bullet">
                    <li>Voltage: {feeBreakdown.voltageValue}kV</li>
                    <li>Chargeable sensitive area: {feeBreakdown.hasChargeableSensitiveArea ? 'Yes' : 'No'}</li>
                    {feeBreakdown.intersectedLayerIds && feeBreakdown.intersectedLayerIds.length > 0 && (
                      <li>Intersected layer IDs: {feeBreakdown.intersectedLayerIds.join(', ')}</li>
                    )}
                    <li>isEiaDevelopment: {feeBreakdown.isEiaDevelopment ? 'Yes' : 'No'}</li>
                    <li>Screening only: {feeBreakdown.screeningOnly ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              </details>
            )} */}

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