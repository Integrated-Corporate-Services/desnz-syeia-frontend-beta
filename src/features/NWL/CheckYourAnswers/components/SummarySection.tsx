import React from 'react';
import { Link } from 'react-router-dom';
import { SummaryRow } from './SummaryRow';
import type { SummarySection as SummarySectionType } from '../types';

interface SummarySectionProps {
  section: SummarySectionType;
  appId: string;
}

/**
 * Summary Section component following GDS Design System
 * Groups related summary rows under a heading
 */
export const SummarySection: React.FC<SummarySectionProps> = ({
  section,
  appId,
}) => {
  const {
    heading,
    rows,
    headingLevel = 'h2',
    changeLink,
    changeLinkText = 'Change',
  } = section;

  const HeadingTag = headingLevel;

  return (
    <div className="govuk-summary-card">
      <div className="govuk-summary-card__title-wrapper">
        <HeadingTag className="govuk-summary-card__title">{heading}</HeadingTag>
        {changeLink && (
          <div className="govuk-summary-card__actions">
            <Link
              className="govuk-link"
              to={changeLink.replace(':applicationId', appId)}
            >
              {changeLinkText}
              <span className="govuk-visually-hidden"> {heading.toLowerCase()}</span>
            </Link>
          </div>
        )}
      </div>
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list">
          {rows.map((row, index) => (
            <SummaryRow key={`${row.key}-${index}`} row={row} appId={appId} />
          ))}
        </dl>
      </div>
    </div>
  );
};
