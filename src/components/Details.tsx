import React, { useState } from 'react';

interface DetailsProps {
  summary: string;
  children: React.ReactNode;
  id: string;
  initialOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Visually identical to GOV.UK's native <details>/<summary> (same classes, same
 * CSS-drawn triangle), but built on a real <button> instead of <summary>.
 * Chromium maps the native <summary> tag to an internal "disclosure triangle"
 * accessibility role regardless of styling, which TalkBack announces aloud -
 * a <button> with aria-expanded avoids that role entirely.
 *
 * The wrapping div carries a literal `open` attribute (not a custom data-*
 * attribute) specifically so GOV.UK Frontend's own existing CSS rule
 * (`.govuk-details[open] > .govuk-details__summary:before`) draws the
 * rotated/open triangle - no extra CSS needed.
 */
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
