import React from "react";
import { Link } from "react-router-dom";
import { S37_BASE_URL } from '../../../constants/s37';
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
  requestUrl,
  notRequiredUrl = "#",
  consultationId,
  applicationId,
  dateRequestCreated,
  evidenceUrl,
  evidenceLabel,
}) => {
  // Normalize status to key in ConsultationStatus
  function getStatusKey(statusValue: string): keyof typeof ConsultationStatus | undefined {
    const entry = Object.entries(ConsultationStatus).find(([, v]) => v.toLowerCase() === statusValue.toLowerCase());
    return entry ? entry[0] as keyof typeof ConsultationStatus : undefined;
  }

  const statusKey = getStatusKey(status);
  const statusDisplay = statusKey ? ConsultationStatus[statusKey] : status;

  const requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultee-application-details${
    consultationName ? `?consultationName=${encodeURIComponent(consultationName)}` : ""
  }`;

  // Format date as 'd MMM yyyy' (e.g., 16 Oct 2025)
  function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Render different card layouts based on status
  function renderCardContent() {
    switch (statusDisplay) {
      case ConsultationStatus.REQUEST_SENT:
        return (
          <>
            <div className="govuk-summary-card__title-wrapper">
              <div className="govuk-summary-card__title" style={{ display: 'flex', alignItems: 'center' }}>
                <Link to={requestUrlWithParams} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-right-2">Upload response</Link>
                <span aria-hidden="true" className="govuk-!-margin-horizontal-2 " style={{ color: '#b1b4b6' }}>|</span>
                <Link to="#" className="govuk-link govuk-!-font-weight-bold govuk-!-margin-left-2">Withdraw</Link>
              </div>
            </div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0" style={{ width: '100%' }}>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell" >Status</td>
                    <td className="govuk-table__cell" >
                      <span className="govuk-tag govuk-tag--blue">{statusDisplay}</span>
                    </td>
                  </tr>
                  {dateRequestCreated && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" >Date Request Created</td>
                      <td className="govuk-table__cell">{formatDate(dateRequestCreated)}</td>
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
          </>
        );
      case ConsultationStatus.CLOSED:
        return (
          <>
            <div className="govuk-summary-card__title-wrapper">
              <div className="govuk-summary-card__title">Status</div>
            </div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0" style={{ width: '100%' }}>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell" style={{ fontWeight: 700, width: '30%' }}>Status</td>
                    <td className="govuk-table__cell" style={{ whiteSpace: 'nowrap', width: '70%' }}>
                      <span className="govuk-tag govuk-tag--green">Closed</span>
                    </td>
                  </tr>
                  {dateRequestCreated && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Date request created</td>
                      <td className="govuk-table__cell">{formatDate(dateRequestCreated)}</td>
                    </tr>
                  )}
                  {evidenceUrl && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Evidence of request</td>
                      <td className="govuk-table__cell">
                        <a href={evidenceUrl} className="govuk-link" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                      </td>
                    </tr>
                  )}
                  {/* Add more closed-specific fields here as needed */}
                </tbody>
              </table>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="govuk-summary-card__title-wrapper">
              <div className="govuk-summary-card__title" style={{ display: 'flex', alignItems: 'center' }}>
                <Link to={requestUrlWithParams} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-right-2">Request Consultation</Link>
                <span aria-hidden="true" className="govuk-!-margin-horizontal-2 " style={{ color: '#b1b4b6' }}>|</span>
                <Link to={notRequiredUrl} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-left-2">Not required</Link>
              </div>
            </div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0" style={{ width: '100%' }}>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td  style={{ fontWeight: 700, width: '30%' }}>Status</td>
                    <td  style={{ whiteSpace: 'nowrap', width: '70%' }}>
                      <span className="govuk-tag govuk-tag--blue">{statusDisplay}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        );
    }
  }

  return (
    <div>
      <h2 className="govuk-heading-m govuk-!-margin-top-6">{orgName}</h2>
      <div className="govuk-summary-card govuk-!-margin-bottom-6">
        {renderCardContent()}
      </div>
    </div>
  );
};

export default ConsultationSummaryCard;
