import React from 'react';
import { Link } from 'react-router-dom';
import { NegotiationsData } from '../../Negotiations/types/negotiations';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';
import { SummaryRow, DocumentLink } from '../types';
import { createSummaryRow } from '../utils';

interface NegotiationsSummaryCardProps {
  data: NegotiationsData;
  applicationId: string;
  canEdit: boolean;
}

const formatStartDate = (data: NegotiationsData): string => {
  if (data.negotiations_start_date_day && data.negotiations_start_date_month && data.negotiations_start_date_year) {
    const day = String(data.negotiations_start_date_day).padStart(2, '0');
    const month = String(data.negotiations_start_date_month).padStart(2, '0');
    const year = data.negotiations_start_date_year;
    return `${day}/${month}/${year}`;
  }

  if (data.negotiations_start_date) {
    const date = new Date(data.negotiations_start_date);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return data.negotiations_start_date;
  }

  return CONSTANTS.NEGOTIATIONS_FIELDS.NOT_PROVIDED;
};

const getEvidenceDocuments = (data: NegotiationsData): DocumentLink[] => {
  const evidenceDocs = Array.isArray(data.evidence_documents) ? data.evidence_documents : [];
  
  if (evidenceDocs.length === 0) return [];

  return evidenceDocs
    .filter((doc: any) => doc.filename)
    .map((doc: any) => {
      const fileKey = doc.fileUrl || doc.s3_key || doc.file_id;
      const filename = doc.filename;
      const downloadUrl = `/api/file/download?key=${encodeURIComponent(fileKey)}`;
      return { fileKey, filename, downloadUrl };
    });
};

const NegotiationsSummaryCard: React.FC<NegotiationsSummaryCardProps> = ({ data, applicationId, canEdit }) => {
  if (!data) {
    return (
      <div className="govuk-summary-card govuk-!-margin-bottom-4">
        <div className="govuk-summary-card__title-wrapper">
          <h3 className="govuk-summary-card__title">{CONSTANTS.CARD_TITLES.NEGOTIATIONS}</h3>
        </div>
      </div>
    );
  }

  const hasNegotiations = data.has_negotiations === true;
  const comments = data.negotiations_comments || CONSTANTS.NEGOTIATIONS_FIELDS.NOT_PROVIDED;
  const noNegotiationsReason = data.no_negotiations_reason || CONSTANTS.NEGOTIATIONS_FIELDS.NOT_PROVIDED;

  const rows: SummaryRow[] = [];

  rows.push(createSummaryRow(
    CONSTANTS.NEGOTIATIONS_FIELDS.HAS_NEGOTIATIONS,
    hasNegotiations ? 'Yes' : 'No'
  ));

  if (hasNegotiations) {
    rows.push(createSummaryRow(
      CONSTANTS.NEGOTIATIONS_FIELDS.START_DATE,
      formatStartDate(data)
    ));
    rows.push(createSummaryRow(
      CONSTANTS.NEGOTIATIONS_FIELDS.ADDITIONAL_COMMENTS,
      comments
    ));
    const documents = getEvidenceDocuments(data);
    rows.push({
      key: { text: CONSTANTS.NEGOTIATIONS_FIELDS.EVIDENCE_DOCUMENTS },
      value: { 
        text: documents.length === 0 ? CONSTANTS.NEGOTIATIONS_FIELDS.NO_DOCUMENTS : '',
        documents: documents.length > 0 ? documents : undefined
      },
    });
  } else {
    rows.push(createSummaryRow(
      CONSTANTS.NEGOTIATIONS_FIELDS.NO_NEGOTIATIONS_REASON,
      noNegotiationsReason
    ));
  }

  return (
    <div className="govuk-summary-card govuk-!-margin-bottom-4">
      <div className="govuk-summary-card__title-wrapper">
        <h3 className="govuk-summary-card__title">{CONSTANTS.CARD_TITLES.NEGOTIATIONS}</h3>
        {canEdit && (
          <Link
            className="govuk-link govuk-summary-card__actions"
            to={`${NWL_BASE_URL}/${applicationId}/existing-negotiations`}
          >
            {CONSTANTS.ACTIONS.CHANGE}
          </Link>
        )}
      </div>
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list govuk-!-margin-bottom-0">
          {rows.map((row, index) => (
            <div className="govuk-summary-list__row" key={index}>
              <dt className="govuk-summary-list__key govuk-!-width-one-half">{row.key.text}</dt>
              <dd className="govuk-summary-list__value govuk-!-width-one-half">
                {row.value.documents ? (
                  <div>
                    {row.value.documents.map((doc, docIndex) => (
                      <React.Fragment key={doc.fileKey}>
                        {docIndex > 0 && <br />}
                        <a 
                          href={doc.downloadUrl} 
                          className="govuk-link"
                          data-file-key={doc.fileKey}
                          data-filename={doc.filename}
                        >
                          {doc.filename}
                        </a>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  row.value.text
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export { NegotiationsSummaryCard };