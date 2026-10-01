import React, { useState } from 'react';

interface DetailsProps {
  summary: string;
  children: React.ReactNode;
  id: string;
  initialOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}


const Details: React.FC<DetailsProps> = ({ summary, children, id, initialOpen = false, className, style }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const contentId = `details-text-${id}`;

  return (
    <div className={`govuk-details${className ? ` ${className}` : ''}`} open={isOpen || undefined} style={style}>
      <button
        type="button"
        className="govuk-details__summary"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="govuk-details__summary-text">{summary}</span>
      </button>
      <div
        className="govuk-details__text"
        id={contentId}
        style={{ display: isOpen ? undefined : 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

export default Details;
