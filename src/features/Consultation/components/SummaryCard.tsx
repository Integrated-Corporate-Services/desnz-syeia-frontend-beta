import React from "react";
import { Link } from "react-router-dom";
import { ConsultationStatus } from "../../../constants/consultationStatus";

interface ConsultationSummaryCardProps {
  orgName: string | null;
  status: string;
  statusColor?: string; // Optional for future use
  requestUrl?: string;
  notRequiredUrl?: string;
}

const ConsultationSummaryCard: React.FC<ConsultationSummaryCardProps> = ({
  orgName,
  status,
  requestUrl = "#",
  notRequiredUrl = "#",
}) => {
  // Map status code to display value using ConsultationStatus constants
  const statusDisplay =
    ConsultationStatus[status as keyof typeof ConsultationStatus] || status;
  return (
    <div>
      <h2 className="govuk-heading-m govuk-!-margin-top-6">{orgName}</h2>
      <div className="govuk-summary-card govuk-!-margin-bottom-6">
        <div className="govuk-summary-card__title-wrapper">
          <div className="govuk-summary-card__title" style={{ display: 'flex', alignItems: 'center' }}>
            <Link to={requestUrl} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-right-2">Consultation Request</Link>
            <span aria-hidden="true" className="govuk-!-margin-horizontal-2 " style={{ color: '#b1b4b6' }}>|</span>
            <Link to={notRequiredUrl} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-left-2">Not required</Link>
          </div>
        </div>
        <div className="govuk-summary-card__content">
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Status</dt>
              <dd className="govuk-summary-list__value">
                <span className="govuk-tag govuk-tag--blue">{statusDisplay}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
       
};

export default ConsultationSummaryCard;
