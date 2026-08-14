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
              <Link to={section.changeUrl} className="govuk-link">
                Change<span className="govuk-visually-hidden"> {section.title}</span>
              </Link>
            </div>
          )}
        </div>
        <div className="govuk-summary-card__content">
          <table className="govuk-table govuk-!-margin-bottom-0">
            <tbody className="govuk-table__body">
              {section.items.map((item, i) => (
                <tr className="govuk-table__row" key={i}>
                  <td className="govuk-table__cell govuk-!-font-weight-bold">{item.label}</td>
                  <td className="govuk-table__cell">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </>
);

export default SummaryCard;
