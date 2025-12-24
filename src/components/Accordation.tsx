import React, { useState } from "react";

interface AccordionSection {
  heading: string;
  children: React.ReactNode;
  id: string;
}

interface AccordionProps {
  sections: AccordionSection[];
  heading?: string;
}

const Accordion: React.FC<AccordionProps> = ({ sections, heading }) => {
  const [openSections, setOpenSections] = useState<{ [id: string]: boolean }>(
    sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  );

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {sections.map(section => (
        <div className="govuk-accordion__section govuk-!-margin-bottom-6 accordion-section" key={section.id}>
          <h2 className="govuk-accordion__section-heading" id={`accordion-section-heading-${section.id}`}>
            <button
              type="button"
              className="govuk-accordion__section-button"
              id={`accordion-section-button-${section.id}`}
              aria-controls={`accordion-section-content-${section.id}`}
              aria-expanded={openSections[section.id]}
              aria-labelledby={`accordion-section-heading-${section.id}`}
              onClick={() => toggleSection(section.id)}
            >
              <span className="govuk-accordion__section-heading-text">
                {section.heading}
              </span>
              <span className="govuk-accordion__section-toggle" data-nosnippet="">
                <span className="govuk-accordion__section-toggle-focus">
                  <span className={`govuk-accordion-nav__chevron${openSections[section.id] ? " govuk-accordion-nav__chevron--down" : ""}`}></span>
                  <span className="govuk-accordion__section-toggle-text">
                    {openSections[section.id] ? "Hide" : "Show"}
                  </span>
                </span>
              </span>
            </button>
          </h2>
          <div
            id={`accordion-section-content-${section.id}`}
            className="govuk-accordion__section-content"
            style={{ display: openSections[section.id] ? 'block' : 'none', marginTop: '8px' }}
            aria-labelledby={`accordion-section-heading-${section.id}`}
          >
            {section.children}
          </div>
        </div>
      ))}
    </>
  );
};

export default Accordion;
