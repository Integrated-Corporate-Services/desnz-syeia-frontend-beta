import React from 'react';
import { Link } from 'react-router-dom';

export interface ObjectionSummaryRow {
  /** Error summary links jump here when submitting finds this answer missing. */
  id?: string;
  label: string;
  value: React.ReactNode;
  changeTo?: string;
}

interface ObjectionSummaryCardProps {
  title: string;
  rows: ObjectionSummaryRow[];
  /** A single Change link for the whole card, used when every row is changed on the same page. */
  changeTo?: string;
}

/**
 * GOV.UK summary card for the objection answers. The shared SummaryCard only takes text values and a card-level link,
 * so this one adds row-level Change links and formatted values (addresses, document lists).
 */
const ObjectionSummaryCard: React.FC<ObjectionSummaryCardProps> = ({ title, rows, changeTo }) => (
  <div className="govuk-summary-card">
    <div className="govuk-summary-card__title-wrapper">
      <h2 className="govuk-summary-card__title">{title}</h2>
      {changeTo && (
        <ul className="govuk-summary-card__actions">
          <li className="govuk-summary-card__action">
            <Link className="govuk-link" to={changeTo}>
              Change<span className="govuk-visually-hidden"> {title.toLowerCase()}</span>
            </Link>
          </li>
        </ul>
      )}
    </div>
    <div className="govuk-summary-card__content">
      <dl className="govuk-summary-list">
        {rows.map((row) => (
          <div className={`govuk-summary-list__row${row.changeTo ? '' : ' govuk-summary-list__row--no-actions'}`} key={row.label} id={row.id}>
            <dt className="govuk-summary-list__key">{row.label}</dt>
            <dd className="govuk-summary-list__value">{row.value}</dd>
            {row.changeTo && (
              <dd className="govuk-summary-list__actions">
                <Link className="govuk-link" to={row.changeTo}>
                  Change<span className="govuk-visually-hidden"> {row.label.toLowerCase()}</span>
                </Link>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  </div>
);

export default ObjectionSummaryCard;
