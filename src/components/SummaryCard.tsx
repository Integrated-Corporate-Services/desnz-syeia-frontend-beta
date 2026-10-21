import React from "react";
import { Link } from "react-router-dom";

interface SummaryCardSection {
  title: string;
  items: { label: string; value: string }[];
  changeUrl?: string;
}

interface SummaryCardProps {
  sections: SummaryCardSection[];
  heading?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ sections, heading }) => (
  <>
    {heading && (
      <h2 className="govuk-heading-l govuk-!-margin-bottom-2">{heading}</h2>
    )}
    {sections.map((section, idx) => (
      <div className="govuk-summary-card govuk-!-margin-bottom-6" key={idx}>
        <div className="govuk-summary-card__title-wrapper">
          <h3 className="govuk-summary-card__title">{section.title}</h3>
          {section.changeUrl && (
            <div className="govuk-summary-card__actions">
              <Link to={section.changeUrl} className="govuk-link">Change</Link>
            </div>
          )}
        </div>
        <div className="govuk-summary-card__content">
          <dl className="govuk-summary-list govuk-!-margin-bottom-0">
            {section.items.map((item, i) => (
              <div className="govuk-summary-list__row" key={i}>
                <dt className="govuk-summary-list__key">{item.label}</dt>
                <dd className="govuk-summary-list__value">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    ))}
  </>
);

export default SummaryCard;
