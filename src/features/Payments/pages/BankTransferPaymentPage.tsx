import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import {
  BANK_DETAILS,
  PAYMENT_PAGE_TITLES,
  PAYMENT_INFO_MESSAGES,
  PAYMENT_ERROR_MESSAGES,
  PAYMENT_BUTTON_LABELS,
} from '../../../constants/payment';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const BankTransferPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('');
  const [resolvedInvoiceNumber, setResolvedInvoiceNumber] = useState<string | null>(null);
  const [resolvedTotalAmount, setResolvedTotalAmount] = useState<number | null>(null);

  const { invoiceNumber, totalAmount } = location.state || {};

  const effectiveInvoiceNumber = useMemo(
    () => invoiceNumber || resolvedInvoiceNumber || sessionStorage.getItem('invoiceNumber') || '',
    [invoiceNumber, resolvedInvoiceNumber]
  );

  const effectiveTotalAmount = useMemo(() => {
    if (typeof totalAmount === 'number' && !Number.isNaN(totalAmount)) {
      return totalAmount;
    }
    if (typeof resolvedTotalAmount === 'number' && !Number.isNaN(resolvedTotalAmount)) {
      return resolvedTotalAmount;
    }
    const storedAmount = sessionStorage.getItem('totalAmount');
    if (storedAmount) {
      const parsed = Number(storedAmount);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return null;
  }, [totalAmount, resolvedTotalAmount]);

  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;

  useEffect(() => {
    const loadInvoiceAndAmountIfNeeded = async () => {
      if (!applicationId) {
        return;
      }

      if (invoiceNumber) {
        sessionStorage.setItem('invoiceNumber', invoiceNumber);
      } else if (!resolvedInvoiceNumber && !sessionStorage.getItem('invoiceNumber')) {
        try {
          const response = await fetch(buildBackendUrl(`/backend/api/invoice/${applicationId}/status`), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            if (result.invoiceExists && result.invoiceNumber) {
              setResolvedInvoiceNumber(result.invoiceNumber);
              sessionStorage.setItem('invoiceNumber', result.invoiceNumber);
            }
          }
        } catch {
          // Keep page usable; submission validation will surface if invoice is missing.
        }
      }

      if (typeof totalAmount === 'number' && !Number.isNaN(totalAmount)) {
        sessionStorage.setItem('totalAmount', totalAmount.toString());
      } else if (resolvedTotalAmount == null && !sessionStorage.getItem('totalAmount')) {
        try {
          const response = await fetch(buildBackendUrl(`/backend/api/invoice/${applicationId}/calculate-fees`), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            if (typeof result.totalAmount === 'number' && result.totalAmount > 0) {
              setResolvedTotalAmount(result.totalAmount);
              sessionStorage.setItem('totalAmount', result.totalAmount.toString());
            }
          }
        } catch {
          // Keep page usable; next step validates amount.
        }
      }
    };

    loadInvoiceAndAmountIfNeeded();
  }, [applicationId, invoiceNumber, totalAmount, resolvedInvoiceNumber, resolvedTotalAmount]);

  const handleContinue = () => {
    if (!isChecked) {
      setError(PAYMENT_ERROR_MESSAGES.CONFIRM_BANK_TRANSFER_REQUIRED);
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView();
      }, 0);
      return;
    }

    if (effectiveInvoiceNumber) {
      sessionStorage.setItem('invoiceNumber', effectiveInvoiceNumber);
    }
    if (typeof effectiveTotalAmount === 'number') {
      sessionStorage.setItem('totalAmount', effectiveTotalAmount.toString());
    }

    // Navigate to confirmation page; the confirmation page will create the BACS payment
    navigate(`${baseUrl}/${applicationId}/bank-transfer-confirmation`, {
      state: { invoiceNumber: effectiveInvoiceNumber, totalAmount: effectiveTotalAmount }
    });
  };

  const handleBackToTaskList = () => {
    navigate(`${baseUrl}/${applicationId}/task-list`);
  };

  return (
    <>
            <div className="govuk-width-container">
              <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={`${baseUrl}/${applicationId}/task-list`}>
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={`${baseUrl}/${applicationId}/payment-method`}>
                Pay and submit
              </Link>
            </li>
          </ol>
        </nav>

        {error && (
          <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>
                  <a href="#confirm-bank-transfer">{error}</a>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{PAYMENT_PAGE_TITLES.BANK_TRANSFER_PAYMENT}</h1>

            <p className="govuk-body">{PAYMENT_INFO_MESSAGES.BANK_TRANSFER_INFO}</p>

            <p className="govuk-body">You must make your payment using these banking details:</p>

            <ul className="govuk-list">
              <li>
                <strong>Account name:</strong> {BANK_DETAILS.ACCOUNT_NAME}
              </li>
              <li>
                <strong>Sort Code:</strong> {BANK_DETAILS.SORT_CODE}
              </li>
              <li>
                <strong>Account Number:</strong> {BANK_DETAILS.ACCOUNT_NUMBER}
              </li>
              <li>
                <strong>Payment reference:</strong> {effectiveInvoiceNumber || '[invoice number]'}
              </li>
            </ul>

            <div className="govuk-inset-text">
              {PAYMENT_INFO_MESSAGES.PAYMENT_REFERENCE_INFO}
            </div>

            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
              <fieldset className="govuk-fieldset">
                {error && (
                  <p id="confirm-bank-transfer-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                )}
                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="confirm-bank-transfer"
                      name="confirm-bank-transfer"
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setIsChecked(e.target.checked);
                        setError('');
                      }}
                      aria-describedby={error ? 'confirm-bank-transfer-error' : undefined}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="confirm-bank-transfer">
                      I confirm I want to pay by bank transfer
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={handleContinue}
              >
                Save and continue
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={handleBackToTaskList}
              >
                {PAYMENT_BUTTON_LABELS.BACK_TO_TASK_LIST}
              </button>
            </div>
          </div>
        </div>
          </div>
    </>
  );
};

export default BankTransferPaymentPage;
