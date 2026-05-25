import React from 'react';

interface NegotiationsSummaryCardProps {
  data: any;
  applicationId: string;
  canEdit: boolean;
}

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

  return (
    <div className="govuk-summary-card govuk-!-margin-bottom-4">
      <div className="govuk-summary-card__title-wrapper">
        <h3 className="govuk-summary-card__title">Negotiations</h3>
        {canEdit && (
          <a className="govuk-link govuk-summary-card__actions" href={`#`}>Change</a>
        )}
      </div>
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list govuk-!-margin-bottom-0">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Negotiations occurred?</dt>
            <dd className="govuk-summary-list__value">{data.has_negotiations ? 'Yes' : 'No'}</dd>
          </div>
          {data.has_negotiations ? (
            <>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Start date</dt>
                <dd className="govuk-summary-list__value">{data.negotiations_start_date || 'Not provided'}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Comments</dt>
                <dd className="govuk-summary-list__value">{data.negotiations_comments || 'Not provided'}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Evidence comments</dt>
                <dd className="govuk-summary-list__value">{data.negotiations_evidence_comments || 'Not provided'}</dd>
              </div>
            </>
          ) : (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Reason for no negotiations</dt>
              <dd className="govuk-summary-list__value">{data.no_negotiations_reason || 'Not provided'}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export { NegotiationsSummaryCard };