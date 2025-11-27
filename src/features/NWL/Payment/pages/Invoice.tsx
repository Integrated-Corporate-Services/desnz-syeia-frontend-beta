import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";

const Invoice: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery =
        searchParams.get("id") || searchParams.get("applicationId");
      if (idFromQuery) return idFromQuery;
    }
    return "";
  };
  const applicationId = getApplicationId();
  // TODO: Replace with real invoice number from API or props
  const invoiceNumber = "[invoice number]";

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
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Payment
          </li>
        </ol>
      </nav>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Your invoice</h1>
      <p>Your invoice number is:</p>
      <p className="govuk-!-font-weight-bold govuk-!-margin-bottom-6">
        {invoiceNumber}
      </p>
      <div className="govuk-button-group">
        <button
          className="govuk-button"
          type="button"
          onClick={() => {
            /* TODO: Download invoice logic */
          }}
        >
          Download invoice
        </button>
        <button
          className="govuk-button govuk-button--secondary"
          type="button"
          onClick={() => navigate(`/nwl/${applicationId}/payment`)}
        >
          Continue to payment
        </button>
      </div>
    </main>
  );
};

export default Invoice;
