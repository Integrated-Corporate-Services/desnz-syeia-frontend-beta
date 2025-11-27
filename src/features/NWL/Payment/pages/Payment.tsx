import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
	  const getApplicationId = () => {
		if (params.applicationId) return params.applicationId;
		if (params.id) return params.id;
		if (typeof window !== 'undefined') {
		  const searchParams = new URLSearchParams(window.location.search);
		  const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
		  if (idFromQuery) return idFromQuery;
		}
		return '';
	  };
	  const applicationId = getApplicationId();
  // Example payment breakdown, replace with props or API data as needed
  const paymentItems = [
    {
      item: "Overhead Lines (Section 37): Consent application for a line of 132kV or less",
      amount: 402.50,
    },
    {
      item: "Overhead Lines (Section 37): Request for consent application EIA screening",
      amount: 60.00,
    },
  ];
  const total = paymentItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link
                        className="govuk-breadcrumbs__link"
                        to={`${NWL_BASE_URL}/${applicationId}/task-list`}
                    >
                        Task list
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">Payment</li>
            </ol>
        </nav>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Payment required</h1>
      <p className="govuk-body">You must pay <strong>£{total.toFixed(2)}</strong> to submit this application.</p>
      <p className="govuk-body">Here is the breakdown of your payment:</p>
      <table className="govuk-table govuk-!-margin-bottom-6">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header">Item</th>
            <th className="govuk-table__header">Amount</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {paymentItems.map((item, idx) => (
            <tr className="govuk-table__row" key={idx}>
              <td className="govuk-table__cell govuk-!-font-weight-bold">{item.item}</td>
              <td className="govuk-table__cell">£{item.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-font-weight-bold">TOTAL</td>
            <td className="govuk-table__cell govuk-!-font-weight-bold">£{total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div className="govuk-inset-text govuk-!-margin-bottom-6">
        You need to generate an invoice to move to the next step.
      </div>
      <button
        className="govuk-button govuk-!-margin-right-2"
        type="button"
        onClick={() => navigate(`/nwl/${applicationId}/invoice`)}
      >
        Generate invoice
      </button>
      <button className="govuk-button govuk-button--secondary" type="button" onClick={() => navigate(-1)}>Back to task list</button>
    </main>
  );
};

export default Payment;
