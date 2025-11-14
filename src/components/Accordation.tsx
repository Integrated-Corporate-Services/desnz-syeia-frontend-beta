import React, { useState } from "react";

interface AccordationSection {
  heading: string;
  children: React.ReactNode;
  id: string;
}

interface AccordationProps {
  sections: AccordationSection[];
  heading?: string;
}

const Accordation: React.FC<AccordationProps> = ({ sections, heading }) => {
  const [openSections, setOpenSections] = useState<{ [id: string]: boolean }>(
    sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  );

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {sections.map(section => (
        <div className="accordation-section govuk-!-margin-bottom-6" key={section.id}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <button type="button" aria-controls={section.id} className="govuk-accordion__section-button" aria-expanded={openSections[section.id]}  onClick={() => toggleSection(section.id)}>
     
              {openSections[section.id] ? (
              <span className="govuk-accordion__section-toggle" data-nosnippet=""><span className="govuk-accordion__section-toggle-focus"><span className="govuk-accordion-nav__chevron govuk-accordion-nav__chevron--down"></span><span className="govuk-accordion__section-toggle-text">Hide</span></span></span>
              ) : (
                <span>
                <span className="govuk-accordion__section-heading-text" id="accordion-default-heading-2"><span className="govuk-accordion__section-heading-text-focus">
         {section.heading}
        </span></span><span className="govuk-visually-hidden govuk-accordion__section-heading-divider">, </span><span className="govuk-accordion__section-toggle" data-nosnippet=""><span className="govuk-accordion__section-toggle-focus"><span className="govuk-accordion-nav__chevron"></span><span className="govuk-accordion__section-toggle-text">Show</span></span></span>
              </span>
            )}
            </button>
          </div>
          <div
            id={section.id}
            style={{ display: openSections[section.id] ? 'block' : 'none', marginTop: '8px' }}
          >
            {section.children}
          </div>
        </div>
      ))}
    </>
  );
};

export default Accordation;
