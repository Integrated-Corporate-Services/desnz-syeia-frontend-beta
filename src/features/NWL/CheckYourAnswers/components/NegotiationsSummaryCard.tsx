import React from 'react';
import { Link } from 'react-router-dom';
import { NegotiationsData } from '../../Negotiations/types/negotiations';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('NegotiationsSummaryCard');

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
  const evidenceDocs = Array.isArray(data.negotiations_evidence_documents) ? data.negotiations_evidence_documents : [];
  
  if (evidenceDocs.length === 0) return 'No documents uploaded';

  const docLinks = evidenceDocs
    .filter((doc: any) => doc.filename)
    .map((doc: any) => {
      const fileKey = doc.fileUrl || doc.s3_key || doc.file_id;
      const filename = doc.filename;
      return `<a href="#" class="govuk-link" data-file-key="${fileKey}" data-filename="${filename}">${filename}</a>`;
    })
    .join('<br>');

  return docLinks || 'No documents uploaded';
};

const NegotiationsSummaryCard: React.FC<NegotiationsSummaryCardProps> = ({ data, applicationId, canEdit }) => {
  React.useEffect(() => {
    const handleDocClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.hasAttribute('data-file-key')) {
        e.preventDefault();
        const fileKey = target.getAttribute('data-file-key');
        if (fileKey) {
          try {
            await downloadS3FileOnSameTab(fileKey);
          } catch (error) {
            logger.error('Failed to download document', { error, fileKey });
          }
        }
      }
    };

    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  if (!data) {
    return (
      <div className="govuk-summary-card govuk-!-margin-bottom-4">
        <div className="govuk-summary-card__title-wrapper">
          <h3 className="govuk-summary-card__title">Negotiations</h3>
        </div>
      </div>
    );
  }

  const hasNegotiations = data.negotiations_occurred === true;
  const comments = data.negotiations_additional_comments || 'Not provided';
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
                <dd className="govuk-summary-list__value" dangerouslySetInnerHTML={{ __html: getEvidenceDocumentTitles(data) }}></dd>
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