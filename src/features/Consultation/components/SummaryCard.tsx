import React from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { ConsultationStatus } from '../../../constants/consultationStatus';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';
import { createLogger } from '../../../utils/logger';
import { StatusBadge } from '../../../components/shared/StatusBadge';

const logger = createLogger('ConsultationSummaryCard');

interface DocumentType {
    url: string;
    name?: string;
    key?: string;
    filename?: string;
    fileName?: string;
}

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
    secondDatePublished?: string;
    evidenceUrl?: string;
    evidenceLabel?: string;
    dateClosed?: string;
    objectionRaised?: boolean;
    consultationType?: string;
    closeComments?: string;
    responseDocuments?: DocumentType[];
    respondingConsulteeName?: string;
    respondingConsulteeEmail?: string;
    notRequiredMessage?: string;
    notRequiredDocs?: DocumentType[];
    consultationRequestDocs?: DocumentType[];
    lpaConsultationForm?: DocumentType[];
    evidenceResponseNotReceivedDocs?: DocumentType[];
    onRemove?: () => void;
}

const ConsultationSummaryCard: React.FC<ConsultationSummaryCardProps> = ({
    orgName,
    consultationName,
    status,
    consultationId,
    applicationId,
    consultationType,
    dateRequestCreated,
    secondDatePublished,
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
    consultationRequestDocs,
    lpaConsultationForm,
    evidenceResponseNotReceivedDocs,
    onRemove,
}) => {
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * Normalize status string to ConsultationStatus enum key
     */
    function getStatusKey(statusValue: string): keyof typeof ConsultationStatus | undefined {
        const entry = Object.entries(ConsultationStatus).find(([, v]) => v.toLowerCase() === statusValue.toLowerCase());
        return entry ? (entry[0] as keyof typeof ConsultationStatus) : undefined;
    }

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================

    // Use consultationName as fallback for title
    const displayName = orgName || consultationName || 'Consultation';

    const statusKey = getStatusKey(status);
    const statusDisplay = statusKey ? ConsultationStatus[statusKey] : status;
    
    // Determine response path based on consultation type
    const responsePath = consultationType === 'LPA' ? 'response-initial' : 'response';
    const responseUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/${responsePath}${consultationName || orgName ? `?consultationName=${encodeURIComponent(consultationName || orgName || '')}` : ''}`;

    // Determine request URL based on consultation type and status
    let requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/initial-question${consultationName ? `?consultationName=${encodeURIComponent(consultationName)}` : ''}`;
    if (consultationType === 'PUBLIC') {
        requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/public-notices`;
    } else if (statusDisplay === ConsultationStatus.DRAFT) {
        requestUrlWithParams = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultation-request${consultationName ? `?consultationName=${encodeURIComponent(consultationName)}` : ''}`;
    }

    const notRequiredPageUrl = `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/not-required${consultationName || orgName ? `?consultationName=${encodeURIComponent(consultationName || orgName || '')}` : ''}`;
    // Format date as 'd MMM yyyy' (e.g., 16 Oct 2025)
    function formatDate(dateStr?: string) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    /**
     * Render a clickable document link with S3 download
     */
    function renderDocumentLink(doc: DocumentType, idx: number) {
        const displayName = doc.name || doc.filename || doc.fileName || '';
        // Truncate extremely long filenames for display
        const truncatedName = displayName.length > 40 ? `${displayName.substring(0, 37)}...` : displayName;
        
        return (
            <div key={idx} className="govuk-!-margin-bottom-1">
                <a
                    href="#"
                    className="govuk-link govuk-!-word-break govuk-!-display-inline-block govuk-!-width-full"
                    title={displayName}
                    onClick={async (e) => {
                        e.preventDefault();
                        const key = doc.key || doc.url;
                        // const filename = doc.filename || doc.name || doc.fileName;
                        try {
                            await downloadS3FileOnSameTab(key);
                        } catch (error) {
                            logger.error('Failed to download file:', error);
                        }
                    }}
                >
                    {truncatedName}
                </a>
            </div>
        );
    }

    /**
     * Render a table row with label and value
     */
    function renderTableRow(label: string, value: React.ReactNode, additionalClass: string = '') {
        return (
            <tr className="govuk-table__row">
                <td className={`govuk-table__cell govuk-!-font-weight-bold govuk-!-word-break govuk-!-width-one-third govuk-!-vertical-align-top ${additionalClass}`}
                >{label}</td>
                <td className={`govuk-table__cell govuk-!-word-break govuk-!-width-two-thirds govuk-!-vertical-align-top ${additionalClass}`}
                >{value}</td>
            </tr>
        );
    }

    // ============================================================================
    // RENDER FUNCTIONS FOR SPECIFIC STATES
    // ============================================================================

    /**
     * Render card for OTHER consultation type with NOT_STARTED status
     */
    function renderOtherNotStarted() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{displayName}</h2>
                    <ul className="govuk-summary-card__actions">
                        {onRemove && (
                            <li className="govuk-summary-card__action">
                                <a
                                    href="#"
                                    className="govuk-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onRemove();
                                    }}
                                >
                                    Remove
                                </a>
                            </li>
                        )}
                        <li className="govuk-summary-card__action">
                            <Link to={requestUrlWithParams} className="govuk-link">
                                Start consultation
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status={statusDisplay} isConsultation />)}
                            {renderTableRow('Date of consultation request', '-')}
                            {renderTableRow('Evidence of request', '-')}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for NOT_REQUIRED status
     */
    function renderNotRequired() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{displayName}</h2>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status="Closed" isConsultation />)}
                            {renderTableRow('Date closed', dateClosed ? formatDate(dateClosed) : '-')}
                            {renderTableRow('Why this consultation is not required', notRequiredMessage || '-')}
                            {notRequiredDocs && notRequiredDocs.length > 0 && renderTableRow(
                                'Supporting documents',
                                <>{notRequiredDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for PUBLIC consultation with REQUEST_SENT status
     */
    function renderPublicRequestSent() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{displayName}</h2>
                    <ul className="govuk-summary-card__actions">
                        <li className="govuk-summary-card__action">
                            <Link to={responseUrlWithParams} className="govuk-link govuk-!-display-inline-block">
                                Record public responses
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status="Public notices published" isConsultation />)}
                            {renderTableRow('First date published', dateRequestCreated ? formatDate(dateRequestCreated) : '-')}
                            {renderTableRow('Second date published', secondDatePublished ? formatDate(secondDatePublished) : '-')}
                            {renderTableRow(
                                'Evidence of publication',
                                consultationRequestDocs && consultationRequestDocs.length > 0
                                    ? <>{consultationRequestDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : '-'
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for LPA consultation with REQUEST_SENT status
     */
    function renderLpaRequestSent() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{orgName}</h2>
                    <ul className="govuk-summary-card__actions">
                        <li className="govuk-summary-card__action">
                            <Link to={responseUrlWithParams} className="govuk-link">
                                Provide response
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status={statusDisplay} isConsultation />)}
                            {lpaConsultationForm && lpaConsultationForm.length > 0 && renderTableRow(
                                'Consultation request document',
                                <>{lpaConsultationForm.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                            )}
                            {renderTableRow('Date of consultation request', dateRequestCreated ? formatDate(dateRequestCreated) : '-')}
                            {renderTableRow(
                                'Evidence of request',
                                consultationRequestDocs && consultationRequestDocs.length > 0
                                    ? <>{consultationRequestDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : evidenceUrl
                                        ? <a href={evidenceUrl} className="govuk-link govuk-!-word-break" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                                        : '-'
                            )}
                        </tbody>
                    </table>
                    <p className="govuk-body govuk-!-margin-top-3 govuk-!-margin-bottom-0">
                        If the consultee has not responded within 2 months after you sent the request, you may be able to complete your application without uploading their response. Click 'Provide response' to learn more.
                    </p>
                </div>
            </>
        );
    }

    /**
     * Render card for non-LPA consultation with REQUEST_SENT status
     */
    function renderStandardRequestSent() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{orgName}</h2>
                    <ul className="govuk-summary-card__actions">
                        {orgName && orgName.trim().toLowerCase() === 'natural england' && (
                            <li className="govuk-summary-card__action">
                                <Link to={notRequiredPageUrl} className="govuk-link">
                                    Not required
                                </Link>
                            </li>
                        )}
                        <li className="govuk-summary-card__action">
                            <Link to={responseUrlWithParams} className="govuk-link">
                                Provide response
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status={statusDisplay} isConsultation />)}
                          
                            {renderTableRow('Date of consultation request', dateRequestCreated ? formatDate(dateRequestCreated) : '-')}
                            {renderTableRow(
                                'Evidence of request',
                                consultationRequestDocs && consultationRequestDocs.length > 0
                                    ? <>{consultationRequestDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : evidenceUrl
                                        ? <a href={evidenceUrl} className="govuk-link govuk-!-word-break" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                                        : '-'
                            )}
                            {renderTableRow('Consultee contact name', respondingConsulteeName || '-')}
                            {renderTableRow(
                                'Consultee contact email address',
                                respondingConsulteeEmail
                                    ? <a href={`mailto:${respondingConsulteeEmail}`} className="govuk-link govuk-!-word-break">{respondingConsulteeEmail}</a>
                                    : '-'
                            )}
                            {renderTableRow('Objection raised', typeof objectionRaised === 'boolean' ? (objectionRaised ? 'Yes' : 'No') : '-')}
                            {renderTableRow('Date closed', '')}
                            {renderTableRow(
                                'Response documents',
                                responseDocuments && responseDocuments.length > 0
                                    ? <>{responseDocuments.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : '-'
                            )}
                            {renderTableRow('Close Comments', closeComments || '-')}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for PUBLIC consultation with CLOSED status
     */
    function renderPublicClosed() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{displayName}</h2>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status="Closed" isConsultation />)}
                            {renderTableRow('First date published', dateRequestCreated ? formatDate(dateRequestCreated) : '-')}
                            {renderTableRow('Second date published', secondDatePublished ? formatDate(secondDatePublished) : '-')}
                            {renderTableRow(
                                'Evidence of publication',
                                consultationRequestDocs && consultationRequestDocs.length > 0
                                    ? <>{consultationRequestDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : '-'
                            )}
                            {renderTableRow('Objection raised', typeof objectionRaised === 'boolean' ? (objectionRaised ? 'Yes' : 'No') : '-')}
                            {renderTableRow(
                                'Public response documents',
                                responseDocuments && responseDocuments.length > 0
                                    ? <>{responseDocuments.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : '-'
                            )}
                            {renderTableRow('Comments', closeComments || '-')}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for LPA consultation with CLOSED status
     */
    function renderLpaClosed() {
        // Check for evidence of response NOT received
        const hasNotReceivedResponse = !!(evidenceResponseNotReceivedDocs && evidenceResponseNotReceivedDocs.length > 0);

        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{orgName}</h2>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status="Closed" isConsultation />)}
                            {lpaConsultationForm && lpaConsultationForm.length > 0 && renderTableRow(
                                'Consultation request document',
                                <>{lpaConsultationForm.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                            )}
                            {renderTableRow('Date of consultation request', dateRequestCreated ? formatDate(dateRequestCreated) : '-')}
                            {renderTableRow(
                                'Evidence of request',
                                consultationRequestDocs && consultationRequestDocs.length > 0
                                    ? <>{consultationRequestDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : evidenceUrl
                                        ? <a href={evidenceUrl} className="govuk-link govuk-!-word-break" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                                        : '-'
                            )}

                            {/* Show different content based on whether response was received */}
                            {hasNotReceivedResponse ? (
                                // No response received - show date closed and evidence of no response
                                <>
                                    {renderTableRow('Date closed', dateClosed ? formatDate(dateClosed) : '-')}
                                    {renderTableRow(
                                        'Evidence of response not received',
                                        evidenceResponseNotReceivedDocs && evidenceResponseNotReceivedDocs.length > 0
                                            ? <>{evidenceResponseNotReceivedDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                            : '-'
                                    )}
                                </>
                            ) : (
                                // Response received - show full response details
                                <>
                                    {renderTableRow('Consultee contact name', respondingConsulteeName || '-')}
                                    {renderTableRow(
                                        'Consultee contact email address',
                                        respondingConsulteeEmail
                                            ? <a href={`mailto:${respondingConsulteeEmail}`} className="govuk-link govuk-!-word-break">{respondingConsulteeEmail}</a>
                                            : '-'
                                    )}
                                    {renderTableRow('Objection raised', typeof objectionRaised === 'boolean' ? (objectionRaised ? 'Yes' : 'No') : '-')}
                                    {renderTableRow('Date closed', dateClosed ? formatDate(dateClosed) : '-')}
                                    {renderTableRow(
                                        'Response documents',
                                        responseDocuments && responseDocuments.length > 0
                                            ? <>{responseDocuments.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                            : '-'
                                    )}
                                    {renderTableRow('Close Comments', closeComments || '-')}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for non-PUBLIC consultation with CLOSED status
     */
    function renderStandardClosed() {
        // Check for evidence of response NOT received
        const hasNotReceivedResponse = !!(evidenceResponseNotReceivedDocs && evidenceResponseNotReceivedDocs.length > 0);

        // Only consider it as "received response" if we don't have evidence of not received
        const hasReceivedResponse =
            !hasNotReceivedResponse &&
            !!(
                (respondingConsulteeName && respondingConsulteeName.trim() !== '') ||
                (respondingConsulteeEmail && respondingConsulteeEmail.trim() !== '') ||
                (objectionRaised !== null && objectionRaised !== undefined) ||
                (responseDocuments && responseDocuments.length > 0)
            );

        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <div className="govuk-summary-card__title govuk-!-word-break">{orgName}</div>
                </div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {/* Always show Status */}
                            {renderTableRow('Status', <StatusBadge status="Closed" isConsultation />)}

                            {/* Always show Date of consultation request */}
                            {renderTableRow('Date of consultation request', dateRequestCreated ? formatDate(dateRequestCreated) : '-')}

                            {/* Always show Evidence of request */}
                            {renderTableRow(
                                'Evidence of request',
                                consultationRequestDocs && consultationRequestDocs.length > 0
                                    ? <>{consultationRequestDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : evidenceUrl
                                        ? <a href={evidenceUrl} className="govuk-link govuk-!-word-break" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                                        : '-'
                            )}

                            {/* Show response fields only if response was received */}
                            {hasReceivedResponse && (
                                <>
                                    {renderTableRow('Consultee contact name', respondingConsulteeName || '-')}
                                    {renderTableRow(
                                        'Consultee contact email address',
                                        respondingConsulteeEmail
                                            ? <a href={`mailto:${respondingConsulteeEmail}`} className="govuk-link govuk-!-word-break">{respondingConsulteeEmail}</a>
                                            : '-'
                                    )}
                                    {renderTableRow('Objection raised', typeof objectionRaised === 'boolean' ? (objectionRaised ? 'Yes' : 'No') : '-')}
                                    {renderTableRow(
                                        'Response documents',
                                        responseDocuments && responseDocuments.length > 0
                                            ? <>{responseDocuments.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                            : '-'
                                    )}
                                    {renderTableRow('Close Comments', closeComments || '-')}
                                </>
                            )}

                            {/* Show evidence of response not received if applicable */}
                            {hasNotReceivedResponse && renderTableRow(
                                'Evidence of response not received',
                                evidenceResponseNotReceivedDocs && evidenceResponseNotReceivedDocs.length > 0
                                    ? <>{evidenceResponseNotReceivedDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : '-'
                            )}

                            {/* Always show Date closed */}
                            {renderTableRow('Date closed', dateClosed ? formatDate(dateClosed) : '-')}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for WITHDRAWN status
     */
    function renderWithdrawn() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper"></div>
                <div className="govuk-summary-card__content">
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status="Withdrawn" isConsultation />)}
                            {dateRequestCreated && renderTableRow('Withdrawal date', formatDate(dateRequestCreated))}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    /**
     * Render card for default/DRAFT status
     */
    function renderDefault() {
        return (
            <>
                <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title govuk-!-word-break">{orgName}</h2>
                    <ul className="govuk-summary-card__actions">
                        {orgName && orgName.trim().toLowerCase() === 'natural england' && (
                            <li className="govuk-summary-card__action">
                                <Link to={notRequiredPageUrl} className="govuk-link">
                                    Not required
                                </Link>
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
                    <table className="govuk-table govuk-!-margin-bottom-0 govuk-!-width-full">
                        <tbody className="govuk-table__body">
                            {renderTableRow('Status', <StatusBadge status={statusDisplay} isConsultation />)}
                            {renderTableRow('Date of consultation request', dateRequestCreated ? formatDate(dateRequestCreated) : '-')}
                            {renderTableRow(
                                'Evidence of request',
                                consultationRequestDocs && consultationRequestDocs.length > 0
                                    ? <>{consultationRequestDocs.map((doc, idx) => renderDocumentLink(doc, idx))}</>
                                    : evidenceUrl
                                        ? <a href={evidenceUrl} className="govuk-link govuk-!-word-break" target="_blank" rel="noopener noreferrer">{evidenceLabel || evidenceUrl}</a>
                                        : '-'
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    // ============================================================================
    // MAIN RENDER LOGIC
    // ============================================================================

    /**
     * Determine which card content to render based on status and consultation type
     */
    function renderCardContent() {
        // Special case: OTHER consultation type with NOT_STARTED status
        if (consultationType === 'OTHER' && statusDisplay === ConsultationStatus.NOT_STARTED) {
            return renderOtherNotStarted();
        }

        // Render based on status
        switch (statusDisplay) {
            case ConsultationStatus.NOT_REQUIRED:
                return renderNotRequired();

            case ConsultationStatus.REQUEST_SENT:
                if (consultationType === 'PUBLIC') {
                    return renderPublicRequestSent();
                } else if (consultationType === 'LPA') {
                    return renderLpaRequestSent();
                } else {
                    return renderStandardRequestSent();
                }

            case ConsultationStatus.CLOSED:
                if (consultationType === 'PUBLIC') {
                    return renderPublicClosed();
                } else if (consultationType === 'LPA') {
                    return renderLpaClosed();
                } else {
                    return renderStandardClosed();
                }

            case ConsultationStatus.WITHDRAWN:
                return renderWithdrawn();

            default:
                return renderDefault();
        }
    }

    return <div className="govuk-summary-card govuk-!-margin-bottom-6 govuk-!-margin-top-6 govuk-!-word-break">{renderCardContent()}</div>;
};

export default ConsultationSummaryCard;