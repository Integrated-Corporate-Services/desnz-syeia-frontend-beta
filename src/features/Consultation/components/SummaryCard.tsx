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
  consultationRequestDocs?: { url: string; name: string; key?: string; filename?: string }[];
}

const ConsultationSummaryCard: React.FC<ConsultationSummaryCardProps> = ({
  orgName,
  consultationName,
  status,
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
  notRequiredDocs,
  consultationRequestDocs
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
  if (statusDisplay === ConsultationStatus.DRAFT) {
    requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultation-request${
      consultationName ? `?consultationName=${encodeURIComponent(consultationName)}` : ""
    }`;
  }
  
  const notRequiredPageUrl = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/not-required${
    (consultationName || orgName) ? `?consultationName=${encodeURIComponent(consultationName || orgName || '')}` : ""
  }`;
  const withdrawnPageUrl = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultation-withdrawn`;
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
            <div className="govuk-summary-card__title-wrapper">
              <h2 className="govuk-summary-card__title">{orgName || consultationName}</h2>
            </div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0">
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Status</td>
                    <td className="govuk-table__cell">
                     <span className="govuk-tag govuk-tag--green">Closed</span>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Date closed</td>
                    <td className="govuk-table__cell">{dateClosed ? formatDate(dateClosed) : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Why this consultation is not required</td>
                    <td className="govuk-table__cell">{notRequiredMessage || '-'}</td>
                  </tr>
                  {notRequiredDocs && notRequiredDocs.length > 0 && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell govuk-!-font-weight-bold">Supporting documents</td>
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
              <h2 className="govuk-summary-card__title">{orgName}</h2>
              <ul className="govuk-summary-card__actions">
                {orgName && orgName.trim().toLowerCase() === 'natural england' && (

                <li className="govuk-summary-card__action">
                  <Link to={notRequiredPageUrl} className="govuk-link">Not required</Link>
                </li>
                )}
                <li className="govuk-summary-card__action">
                  <Link to={responseUrlWithParams} className="govuk-link">Provide response</Link>
                </li>
              </ul>
            </div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0">
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Status</td>
                    <td className="govuk-table__cell">
                      <span className="govuk-tag govuk-tag--blue">{statusDisplay}</span>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Date of consultation request</td>
                    <td className="govuk-table__cell">{dateRequestCreated ? formatDate(dateRequestCreated) : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Evidence of request</td>
                    <td className="govuk-table__cell">
                      {consultationRequestDocs && consultationRequestDocs.length > 0 ? (
                        consultationRequestDocs.map((doc: any, idx: number) => (
                          <div key={idx}>
                            <a href="#" className="govuk-link" onClick={async e => {
                              e.preventDefault();
                              const key = doc.key || doc.url;
                              try {
                                await downloadS3File(key);
                              } catch (error) {
                                console.error("Failed to download file:", error);
                              }
                            }}>
                              {doc.filename || doc.name}
                            </a>
                          </div>
                        ))
                      ) : evidenceUrl ? (
                        <a href={evidenceUrl} className="govuk-link" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                      ) : '-'}
                    </td>
                  </tr>
               <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Consultee contact name</td>
                    <td className="govuk-table__cell">{respondingConsulteeName || '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Consultee contact email address</td>
                    <td className="govuk-table__cell">
                      {respondingConsulteeEmail ? (
                        <a href={`mailto:${respondingConsulteeEmail}`} className="govuk-link">{respondingConsulteeEmail}</a>
                      ) : '-'}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Objection raised</td>
                    <td className="govuk-table__cell">{typeof objectionRaised === 'boolean' ? (objectionRaised ? 'Yes' : 'No') : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Date closed</td>
                    <td className="govuk-table__cell">{dateClosed ? formatDate(dateClosed) : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Response documents</td>
                    <td className="govuk-table__cell">
                      {responseDocuments && responseDocuments.length > 0 ? (
                        responseDocuments.map((doc: any, idx: number) => (
                          <div key={idx}>
                            <a href="#" className="govuk-link" onClick={async e => {
                              e.preventDefault();
                              const key = doc.key || doc.url;
                              try {
                                await downloadS3File(key);
                              } catch (error) {
                                console.error("Failed to download file:", error);
                              }
                            }}>
                              {doc.name || doc.fileName}
                            </a>
                          </div>
                        ))
                      ) : '-'}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Close Comments</td>
                    <td className="govuk-table__cell">{closeComments || '-'}</td>
                  </tr>
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
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Status</td>
                    <td className="govuk-table__cell">
                      <span className="govuk-tag govuk-tag--green">Closed</span>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Date of consultation request</td>
                    <td className="govuk-table__cell">{dateRequestCreated ? formatDate(dateRequestCreated) : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Evidence of request</td>
                    <td className="govuk-table__cell">
                      {consultationRequestDocs && consultationRequestDocs.length > 0 ? (
                        consultationRequestDocs.map((doc: any, idx: number) => (
                          <div key={idx}>
                            <a href="#" className="govuk-link" onClick={async e => {
                              e.preventDefault();
                              const key = doc.key || doc.url;
                              try {
                                await downloadS3File(key);
                              } catch (error) {
                                console.error("Failed to download file:", error);
                              }
                            }}>
                              {doc.filename || doc.name}
                            </a>
                          </div>
                        ))
                      ) : evidenceUrl ? (
                        <a href={evidenceUrl} className="govuk-link" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                      ) : '-'}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Consultee contact name</td>
                    <td className="govuk-table__cell">{respondingConsulteeName || '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Consultee contact email address</td>
                    <td className="govuk-table__cell">
                      {respondingConsulteeEmail ? (
                        <a href={`mailto:${respondingConsulteeEmail}`} className="govuk-link">{respondingConsulteeEmail}</a>
                      ) : '-'}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Objection raised</td>
                    <td className="govuk-table__cell">{typeof objectionRaised === 'boolean' ? (objectionRaised ? 'Yes' : 'No') : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Date closed</td>
                    <td className="govuk-table__cell">{dateClosed ? formatDate(dateClosed) : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Response documents</td>
                    <td className="govuk-table__cell">
                      {responseDocuments && responseDocuments.length > 0 ? (
                        responseDocuments.map((doc: any, idx: number) => (
                          <div key={idx}>
                            <a href="#" className="govuk-link" onClick={async e => {
                              e.preventDefault();
                              const key = doc.key || doc.url;
                              try {
                                await downloadS3File(key);
                              } catch (error) {
                                console.error("Failed to download file:", error);
                              }
                            }}>
                              {doc.name || doc.fileName}
                            </a>
                          </div>
                        ))
                      ) : '-'}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Close Comments</td>
                    <td className="govuk-table__cell">{closeComments || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        );
      case ConsultationStatus.WITHDRAWN:
        return (
          <>
            <div className="govuk-summary-card__title-wrapper"></div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0">
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Status</td>
                    <td className="govuk-table__cell">
                      <span className="govuk-tag  govuk-tag--grey">Withdrawn</span>
                    </td>
                  </tr>
                  {dateRequestCreated && (
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell govuk-!-font-weight-bold">Withdrawal date</td>
                      <td className="govuk-table__cell">{formatDate(dateRequestCreated)}</td>
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
              <h2 className="govuk-summary-card__title">{orgName}</h2>
              <ul className="govuk-summary-card__actions">
                {orgName && orgName.trim().toLowerCase() === 'natural england' && (
                  <li className="govuk-summary-card__action">
                    <Link to={notRequiredPageUrl} className="govuk-link">Not required</Link>
                  </li>
                )}
                <li className="govuk-summary-card__action">
                  <Link to={requestUrlWithParams} className="govuk-link">
                    {statusDisplay === ConsultationStatus.DRAFT ? 'Continue consultation' : 'Start consultation'}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="govuk-summary-card__content">
              <table className="govuk-table govuk-!-margin-bottom-0">
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Status</td>
                    <td className="govuk-table__cell">
                      <span className="govuk-tag govuk-tag--blue">{statusDisplay}</span>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Date of consultation request</td>
                    <td className="govuk-table__cell">{dateRequestCreated ? formatDate(dateRequestCreated) : '-'}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-!-font-weight-bold">Evidence of request</td>
                    <td className="govuk-table__cell">
                      {consultationRequestDocs && consultationRequestDocs.length > 0 ? (
                        consultationRequestDocs.map((doc: any, idx: number) => (
                          <div key={idx}>
                            <a href="#" className="govuk-link" onClick={async e => {
                              e.preventDefault();
                              const key = doc.key || doc.url;
                              try {
                                await downloadS3File(key);
                              } catch (error) {
                                console.error("Failed to download file:", error);
                              }
                            }}>
                              {doc.filename || doc.name}
                            </a>
                          </div>
                        ))
                      ) : evidenceUrl ? (
                        <a href={evidenceUrl} className="govuk-link" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                      ) : '-'}
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
    <div className="govuk-summary-card govuk-!-margin-bottom-6 govuk-!-margin-top-6">
      {renderCardContent()}
    </div>
  );
};

export default ConsultationSummaryCard;
