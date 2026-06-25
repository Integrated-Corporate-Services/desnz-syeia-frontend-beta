import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const InvoiceDownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resolvedTotalAmount, setResolvedTotalAmount] = useState<number | null>(null);
  const [resolvedInvoiceNumber, setResolvedInvoiceNumber] = useState<string | null>(null);
  const [resolvedS3Key, setResolvedS3Key] = useState<string | null>(null);
  
  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;

  const { invoiceNumber, s3Key, consentFee, eiaScreeningFee, totalAmount } = location.state || {};

  const effectiveInvoiceNumber = invoiceNumber || resolvedInvoiceNumber;
  const effectiveS3Key = s3Key || resolvedS3Key;

  const effectiveTotalAmount = useMemo(() => {
    if (typeof totalAmount === 'number' && !Number.isNaN(totalAmount) && totalAmount > 0) {
      return totalAmount;
    }
    if (
      typeof resolvedTotalAmount === 'number' &&
      !Number.isNaN(resolvedTotalAmount) &&
      resolvedTotalAmount > 0
    ) {
      return resolvedTotalAmount;
    }
    return null;
  }, [totalAmount, resolvedTotalAmount]);

  useEffect(() => {
    const loadFeesIfNeeded = async () => {
      if (!applicationId) {
        return;
      }

      if (typeof totalAmount === 'number' && !Number.isNaN(totalAmount) && totalAmount > 0) {
        setResolvedTotalAmount(totalAmount);
        return;
      }

      try {
        const response = await fetch(buildBackendUrl(`/backend/api/invoice/${applicationId}/calculate-fees`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const result = await response.json();
        if (typeof result.totalAmount === 'number' && result.totalAmount > 0) {
          setResolvedTotalAmount(result.totalAmount);
        }
      } catch {
        // Keep existing UI behavior and avoid hard failure when fallback lookup fails.
      }
    };

    loadFeesIfNeeded();
  }, [applicationId, totalAmount]);

  useEffect(() => {
    const loadInvoiceStatusIfNeeded = async () => {
      if (!applicationId) {
        return;
      }

      if (invoiceNumber && s3Key) {
        setResolvedInvoiceNumber(invoiceNumber);
        setResolvedS3Key(s3Key);
        return;
      }

      try {
        const response = await fetch(buildBackendUrl(`/backend/api/invoice/${applicationId}/status`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const result = await response.json();
        if (result.invoiceExists) {
          setResolvedInvoiceNumber(result.invoiceNumber || null);
          setResolvedS3Key(result.s3Key || null);
        }
      } catch {
        // Keep page usable even if invoice status check fails.
      }
    };

    loadInvoiceStatusIfNeeded();
  }, [applicationId, invoiceNumber, s3Key]);

  const handleDownloadInvoice = async () => {
    if (!effectiveInvoiceNumber) {
      setError('Invoice number not available');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Use backend download endpoint with invoice number as query param
      const downloadUrl = buildBackendUrl(`/backend/api/invoice/${applicationId}/download?invoiceNumber=${encodeURIComponent(effectiveInvoiceNumber)}`);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Invoice_${effectiveInvoiceNumber}.pdf`;
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
    navigate(`${baseUrl}/${applicationId}/payment-method`, {
      state: {
        invoiceNumber: effectiveInvoiceNumber,
        totalAmount: effectiveTotalAmount,
        consentFee: consentFee,
        eiaScreeningFee: eiaScreeningFee
      }
    });
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${baseUrl}/${applicationId}/task-list`}>
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            Download Invoice
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

            <h1 className="govuk-heading-l">Your Invoice</h1>
            {effectiveInvoiceNumber && (
              <p className="govuk-body">
                Your invoice number is <strong>{effectiveInvoiceNumber}</strong>.
              </p>
            )}

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                onClick={handleDownloadInvoice}
                disabled={loading || !effectiveS3Key || !effectiveInvoiceNumber}
              >
                {loading ? 'Downloading...' : 'Download Invoice'}
              </button>
            </div>
            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleContinueToPayment}
                disabled={loading || !effectiveTotalAmount || !effectiveInvoiceNumber}
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