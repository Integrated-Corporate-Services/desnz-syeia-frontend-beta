import React from 'react';
import '../../../styles/govuk.scss';

export default function PaymentCallback() {
  // Example data, replace with real payment info if available
  const paymentReference = '123456789-ABC-TEST';
  const paymentFor = 'Application fee';
  const totalAmount = '£236.50';

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper govuk-!-padding-top-6" id="main-content">
        <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6" style={{ textAlign: 'center' }}>
          <h1 className="govuk-panel__title" style={{ fontSize: '2.5rem' }}>Your payment was successful</h1>
          <div className="govuk-panel__body" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
            Your payment reference number is<br />
            <span style={{ fontWeight: 'bold', fontSize: '2rem' }}>{paymentReference}</span>
          </div>
        </div>
        <h2 className="govuk-heading-m govuk-!-margin-bottom-2">What happens next</h2>
        <p className="govuk-body govuk-!-margin-bottom-6">We have sent you a confirmation email with your invoice attached.</p>
        <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Payment summary</h2>
        <table className="govuk-table govuk-!-margin-bottom-6" style={{ maxWidth: 500 }}>
          <tbody className="govuk-table__body">
            <tr className="govuk-table__row">
              <td className="govuk-table__cell">Payment for:</td>
              <td className="govuk-table__cell" style={{ textAlign: 'right' }}>{paymentFor}</td>
            </tr>
            <tr className="govuk-table__row">
              <td className="govuk-table__cell">Total amount:</td>
              <td className="govuk-table__cell" style={{ textAlign: 'right' }}>{totalAmount}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className="govuk-button govuk-button--secondary" type="button">Go to Applications</button>
          <button className="govuk-button" type="button">Submit your application</button>
        </div>
      </main>
    </div>
  );
}
