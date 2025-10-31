import React from "react";
import { Link } from "react-router-dom";
import { ConsultationStatus } from "../../../constants/consultationStatus";

interface ConsultationSummaryCardProps {
  orgName: string | null;
  consultationName?: string | null;
  status: string;
  statusColor?: string; // Optional for future use
  requestUrl?: string;
  notRequiredUrl?: string;
  consultationId: string;
  applicationId: string;
  dateRequestCreated?: string;
  evidenceUrl?: string;
  evidenceLabel?: string;
}

const ConsultationSummaryCard: React.FC<ConsultationSummaryCardProps> = ({
  orgName,
  consultationName,
  status,
  requestUrl = "/consultation/consultee-application-details",
  notRequiredUrl = "#",
  consultationId,
  applicationId,
  dateRequestCreated,
  evidenceUrl,
  evidenceLabel,
}) => {
  // Map status code to display value using ConsultationStatus constants
  const statusDisplay =
    ConsultationStatus[status as keyof typeof ConsultationStatus] || status;

  // Build URL with query params (add consultationName)
  const requestUrlWithParams = `${requestUrl}?consultationId=${encodeURIComponent(
    consultationId
  )}&applicationId=${encodeURIComponent(applicationId)}$${
    consultationName ? `&consultationName=${encodeURIComponent(consultationName)}` : ""
  }`;

  return (
    <div>
      <h2 className="govuk-heading-m govuk-!-margin-top-6">{orgName}</h2>
      <div className="govuk-summary-card govuk-!-margin-bottom-6">
        <div className="govuk-summary-card__title-wrapper">
          <div className="govuk-summary-card__title" style={{ display: 'flex', alignItems: 'center' }}>
            <Link to={requestUrlWithParams} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-right-2">{evidenceUrl ? 'Upload response' : 'Request Consultation'}</Link>
            <span aria-hidden="true" className="govuk-!-margin-horizontal-2 " style={{ color: '#b1b4b6' }}>|</span>
            <Link to={notRequiredUrl} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-left-2">Not required</Link>
            {evidenceUrl && (
              <>
                <span aria-hidden="true" className="govuk-!-margin-horizontal-2 " style={{ color: '#b1b4b6' }}>|</span>
                <Link to="#" className="govuk-link govuk-!-font-weight-bold govuk-!-margin-left-2">Withdraw</Link>
              </>
            )}
          </div>
        </div>
        <div className="govuk-summary-card__content">
          <table className="govuk-table govuk-!-margin-bottom-0" style={{ width: '100%' }}>
            <tbody className="govuk-table__body">
              
              <tr className="govuk-table__row">
                <td
                  className={`govuk-table__cell${!dateRequestCreated && !evidenceUrl ? ' no-border' : ''}`}
                  style={{ fontWeight: 700, width: '30%' }}
                >
                  Status
                </td>
                <td
                  className={`govuk-table__cell${!dateRequestCreated && !evidenceUrl ? ' no-border' : ''}`}
                  style={{ whiteSpace: 'nowrap', width: '70%', verticalAlign: 'middle' }}
                >
                  <span className="govuk-tag govuk-tag--blue">{statusDisplay}</span>
                </td>
              </tr>
              {dateRequestCreated && (
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Date Request Created</td>
                  <td className="govuk-table__cell">{dateRequestCreated}</td>
                </tr>
              )}
              {evidenceUrl && (
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Evidence of Request</td>
                  <td className="govuk-table__cell">
                    <a href={evidenceUrl} className="govuk-link" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSummaryCard;
