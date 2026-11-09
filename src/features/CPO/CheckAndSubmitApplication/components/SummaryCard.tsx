import React from 'react';
import { Link } from 'react-router-dom';

export interface SummaryCardProps {
  title: string;
  /** When set, shows a Change link in the card header. */
  changeUrl?: string;
  children: React.ReactNode;
}

/** GOV.UK summary card shell used by each CPO check-your-answers subsection. */
export const SummaryCard: React.FC<SummaryCardProps> = ({ title, changeUrl, children }) => (
  <div className="govuk-summary-card">
    <div className="govuk-summary-card__title-wrapper">
      <h3 className="govuk-summary-card__title">{title}</h3>
      {changeUrl && <ul className="govuk-summary-card__actions">
        <li className="govuk-summary-card__action">
          <Link className="govuk-link" to={changeUrl}>Change<span className="govuk-visually-hidden"> {title.toLowerCase()}</span></Link>
        </li>
      </ul>}
    </div>
    <div className="govuk-summary-card__content">
      <dl className="govuk-summary-list">{children}</dl>
    </div>
  </div>
);

export default SummaryCard;
