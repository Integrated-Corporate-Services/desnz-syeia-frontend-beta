import React from 'react';
import { Link } from 'react-router-dom';
import type { SummaryRow as SummaryRowType } from '../types';
import { CHANGE_LINK_TEXT } from '../constants/checkYourAnswersConstants';

interface SummaryRowProps {
  row: SummaryRowType;
  appId: string;
}

/**
 * Summary Row component following GDS Design System
 * Displays a single key-value pair with optional change link
 */
export const SummaryRow: React.FC<SummaryRowProps> = ({ row, appId }) => {
  const {
    key,
    value,
    changeLink,
    changeLinkText = CHANGE_LINK_TEXT,
    keyClasses = 'govuk-summary-list__key',
    valueClasses = 'govuk-summary-list__value',
    actionClasses = 'govuk-summary-list__actions',
  } = row;

  return (
    <div className="govuk-summary-list__row">
      <dt className={keyClasses}>{key}</dt>
      <dd className={valueClasses}>
        {value || <span className="govuk-hint">Not provided</span>}
      </dd>
      {changeLink && (
        <dd className={actionClasses}>
          <Link
            className="govuk-link"
            to={changeLink.replace(':applicationId', appId)}
          >
            {changeLinkText}
            <span className="govuk-visually-hidden"> {key.toLowerCase()}</span>
          </Link>
        </dd>
      )}
    </div>
  );
};
