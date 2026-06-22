import React from 'react';
import { Link } from 'react-router-dom';
import { NegotiationsData } from '../../Negotiations/types/negotiations';
import { NWL_BASE_URL } from '../../../../constants/nwl';

interface NegotiationsSummaryCardProps {
  data: NegotiationsData;
  applicationId: string;
  canEdit: boolean;
}

const formatStartDate = (data: NegotiationsData): string => {
  // First try using the separate date parts if available (for backward compatibility)
  if (data.negotiations_start_date_day && data.negotiations_start_date_month && data.negotiations_start_date_year) {
    const day = String(data.negotiations_start_date_day).padStart(2, '0');
    const month = String(data.negotiations_start_date_month).padStart(2, '0');
    const year = data.negotiations_start_date_year;
    return `${day}/${month}/${year}`;
  }

  // If we have the full date string, parse and format it
  if (data.negotiations_start_date) {
    const date = new Date(data.negotiations_start_date);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    // If it's already formatted, return as is
    return data.negotiations_start_date;
  }

  return 'Not provided';
};

const getEvidenceDocumentTitles = (data: NegotiationsData): string => {
  const evidenceDocs = Array.isArray(data.evidence_documents) ? data.evidence_documents : [];
  
  if (evidenceDocs.length === 0) return 'No documents uploaded';

  const docLinks = evidenceDocs
    .filter((doc: any) => doc.filename)
    .map((doc: any) => {
      const fileKey = doc.fileUrl || doc.s3_key || doc.file_id;
      const filename = doc.filename;
      const downloadUrl = `/backend/api/file/download?key=${encodeURIComponent(fileKey)}`;
      return `<a href="${downloadUrl}" class="govuk-link" data-file-key="${fileKey}" data-filename="${filename}">${filename}</a>`;
    })
    .join('<br>');

  return docLinks || 'No documents uploaded';
};

const NegotiationsSummaryCard: React.FC<NegotiationsSummaryCardProps> = ({ data, applicationId, canEdit }) => {
  if (!data) {
    return (
      <div className="govuk-summary-card govuk-!-margin-bottom-4">
        <div className="govuk-summary-card__title-wrapper">
          <h3 className="govuk-summary-card__title">Negotiations</h3>
        </div>
      </div>
    );
  }

  const hasNegotiations = data.has_negotiations === true;
  const comments = data.negotiations_comments || 'Not provided';
  const noNegotiationsReason = data.no_negotiations_reason || 'Not provided';

  return (
    <div className="govuk-summary-card govuk-!-margin-bottom-4">
      <div className="govuk-summary-card__title-wrapper">
        <h3 className="govuk-summary-card__title">Existing negotiations</h3>
        {canEdit && (
          <Link
            className="govuk-link govuk-summary-card__actions"
            to={`${NWL_BASE_URL}/${applicationId}/existing-negotiations`}
          >
            Change
          </Link>
        )}
      </div>
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list govuk-!-margin-bottom-0">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Are there any negotiations in progress?</dt>
            <dd className="govuk-summary-list__value">{hasNegotiations ? 'Yes' : 'No'}</dd>
          </div>
          {hasNegotiations ? (
            <>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Start date of negotiations</dt>
                <dd className="govuk-summary-list__value">{formatStartDate(data)}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Additional comments</dt>
                <dd className="govuk-summary-list__value">{comments}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Evidence of negotiations</dt>
                <dd className="govuk-summary-list__value" dangerouslySetInnerHTML={{ __html: getEvidenceDocumentTitles(data) }}></dd>
              </div>
            </>
          ) : (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Why there have not been any negotiations</dt>
              <dd className="govuk-summary-list__value">{noNegotiationsReason}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export { NegotiationsSummaryCard };