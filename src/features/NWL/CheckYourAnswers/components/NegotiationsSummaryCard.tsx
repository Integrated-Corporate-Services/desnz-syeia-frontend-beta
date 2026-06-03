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
  if (data.negotiations_start_date_day && data.negotiations_start_date_month && data.negotiations_start_date_year) {
    return `${data.negotiations_start_date_day}/${data.negotiations_start_date_month}/${data.negotiations_start_date_year}`;
  }

  if (data.negotiations_start_date) {
    return data.negotiations_start_date;
  }

  return 'Not provided';
};

const getEvidenceDocumentTitles = (data: NegotiationsData): string => {
  const documents = Array.isArray(data.application_documents) ? data.application_documents : [];
  const fileNames = Array.isArray(data.uploaded_files)
    ? data.uploaded_files.map((file) => file.filename).filter(Boolean)
    : [];

  const rawTitles = documents
    .map((doc) => doc.title || doc.fileId)
    .filter(Boolean)
    .concat(fileNames);

  // The same file may exist in both arrays; keep only unique display values.
  const seen = new Set<string>();
  const titles = rawTitles.filter((title) => {
    const key = String(title).trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return titles.length > 0 ? titles.join(', ') : 'No documents uploaded';
};

const NegotiationsSummaryCard: React.FC<NegotiationsSummaryCardProps> = ({ data, applicationId, canEdit }) => {
  if (!data) {
    return (
      <div className="govuk-summary-card govuk-!-margin-bottom-4">
        <div className="govuk-summary-card__title-wrapper">
          <h3 className="govuk-summary-card__title">Negotiations</h3>
        </div>
        <div className="govuk-summary-card__content">
          <p className="govuk-body govuk-!-margin-bottom-0">No information provided yet</p>
        </div>
      </div>
    );
  }

  const hasNegotiations = data.has_negotiations === true;
  const comments = data.negotiations_comments || data.negotiations_evidence_comments || 'Not provided';
  const noNegotiationsReason = data.no_negotiations_reason || 'Not provided';

  return (
    <div className="govuk-summary-card govuk-!-margin-bottom-4">
      <div className="govuk-summary-card__title-wrapper">
        <h3 className="govuk-summary-card__title">Negotiations</h3>
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
            <dt className="govuk-summary-list__key">Negotiations occurred?</dt>
            <dd className="govuk-summary-list__value">{hasNegotiations ? 'Yes' : 'No'}</dd>
          </div>
          {hasNegotiations ? (
            <>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Start date</dt>
                <dd className="govuk-summary-list__value">{formatStartDate(data)}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Additional comments</dt>
                <dd className="govuk-summary-list__value">{comments}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Evidence documents</dt>
                <dd className="govuk-summary-list__value">{getEvidenceDocumentTitles(data)}</dd>
              </div>
            </>
          ) : (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Reason for no negotiations</dt>
              <dd className="govuk-summary-list__value">{noNegotiationsReason}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export { NegotiationsSummaryCard };