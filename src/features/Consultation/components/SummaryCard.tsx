import React from "react";
import { Link } from "react-router-dom";
import { S37_BASE_URL } from '../../../constants/s37';
import { ConsultationStatus } from "../../../constants/consultationStatus";
import { downloadS3File } from '../../../utils/s3DownloadUtil';

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
  dateClosed?: string;
  objectionRaised?: boolean;
  closeComments?: string;
  responseDocuments?: { url: string; name: string }[];
  respondingConsulteeName?: string;
  respondingConsulteeEmail?: string;
  notRequiredMessage?: string;
  notRequiredDocs?: { url: string; name: string }[];
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
  dateClosed,
  objectionRaised,
  closeComments,
  responseDocuments,
  respondingConsulteeName,
  respondingConsulteeEmail,
  notRequiredMessage,
  notRequiredDocs
}) => {
  // Normalize status to key in ConsultationStatus
  function getStatusKey(statusValue: string): keyof typeof ConsultationStatus | undefined {
    const entry = Object.entries(ConsultationStatus).find(([, v]) => v.toLowerCase() === statusValue.toLowerCase());
    return entry ? entry[0] as keyof typeof ConsultationStatus : undefined;
  }

  const statusKey = getStatusKey(status);
  const statusDisplay = statusKey ? ConsultationStatus[statusKey] : status;

  const responseUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/response`;
  let requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultation-request${
    consultationName ? `?consultationName=${encodeURIComponent(consultationName)}` : ""
  }`;
  if (statusDisplay === ConsultationStatus.REQUEST_INCOMPLETE) {
    requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultee-application-details${
      consultationName ? `?consultationName=${encodeURIComponent(consultationName)}` : ""
    }`;
  }
  
  const notRequiredPageUrl = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/not-required`;

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
      case ConsultationStatus.NOT_REQUIRED:
        return (
          <>
            <div className="govuk-summary-card__title-wrapper"></div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0" style={{ width: '100%' }}>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell" style={{ fontWeight: 700, width: '30%' }}>Status</td>
                    <td className="govuk-table__cell" style={{ whiteSpace: 'nowrap', width: '70%' }}>
                      <span className="govuk-tag govuk-tag--grey">Not required</span>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Reason</td>
                    <td className="govuk-table__cell">{notRequiredMessage || 'This consultation is not required'}</td>
                  </tr>
                  {notRequiredDocs && notRequiredDocs.length > 0 && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Supporting documents</td>
                      <td className="govuk-table__cell">
                        {notRequiredDocs.map((doc: any, idx: number) => (
                          <div key={idx}>
                            <a href="#" className="govuk-link" onClick={async e => {
                              e.preventDefault();
                              const key = doc.key || doc.url;
                              downloadS3File(key);
                            }}>{doc.name}</a>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      case ConsultationStatus.REQUEST_SENT:
        return (
          <>
            <div className="govuk-summary-card__title-wrapper">
              <div className="govuk-summary-card__title" style={{ display: 'flex', alignItems: 'center' }}>
                <Link to={responseUrlWithParams} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-right-2">Upload response</Link>
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
              <div className="govuk-summary-card__title"></div>
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
                  {/* Additional closed status fields */}
                  {dateClosed && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Date closed</td>
                      <td className="govuk-table__cell">{formatDate(dateClosed)}</td>
                    </tr>
                  )}
                  {(typeof objectionRaised === 'boolean') && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Objection raised</td>
                      <td className="govuk-table__cell">{objectionRaised ? 'Yes' : 'No'}</td>
                    </tr>
                  )}
                  {closeComments && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Close Comments</td>
                      <td className="govuk-table__cell">{closeComments}</td>
                    </tr>
                  )}
                  {responseDocuments && responseDocuments.length > 0 && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Response documents</td>
                      <td className="govuk-table__cell">
                        {responseDocuments.map((doc: any, idx: number) => (
                          <div key={idx}>
                            <a href="#" className="govuk-link" onClick={async e => {
                              e.preventDefault();
                              const key = doc.key || doc.url;
                              downloadS3File(key);
                            }}>{doc.name}</a>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                  {respondingConsulteeName && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Responding consultee’s name</td>
                      <td className="govuk-table__cell">{respondingConsulteeName}</td>
                    </tr>
                  )}
                  {respondingConsulteeEmail && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ fontWeight: 700 }}>Responding consultee’s email address</td>
                      <td className="govuk-table__cell">
                        <a href={`mailto:${respondingConsulteeEmail}`} className="govuk-link">{respondingConsulteeEmail}</a>
                      </td>
                    </tr>
                  )}
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
                {orgName && orgName.trim().toLowerCase() === 'natural england' && (
                  <>
                    <span aria-hidden="true" className="govuk-!-margin-horizontal-2 " style={{ color: '#b1b4b6' }}>|</span>
                    <Link to={notRequiredPageUrl} className="govuk-link govuk-!-font-weight-bold govuk-!-margin-left-2">Not required</Link>
                  </>
                )}
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
