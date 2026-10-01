import React, { useState, useRef, useLayoutEffect } from 'react';

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
 * `open` is a real, valid HTML attribute GOV.UK Frontend's own CSS keys off
 * (`.govuk-details[open] > .govuk-details__summary:before` draws the rotated
 * triangle) - but React's typing only allows it on <details>/<dialog>, not
 * <div>, so it's set imperatively via a ref rather than as a JSX prop.
 */
const Details: React.FC<DetailsProps> = ({ summary, children, id, initialOpen = false, className, style }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentId = `details-text-${id}`;

  useLayoutEffect(() => {
    if (isOpen) {
      wrapperRef.current?.setAttribute('open', '');
    } else {
      wrapperRef.current?.removeAttribute('open');
    }
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={`govuk-details${className ? ` ${className}` : ''}`} style={style}>
      <button
        type="button"
        className="govuk-details__summary"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          // .govuk-details__summary only ever had to style a native <summary>,
          // which has no default button chrome - reset what a real <button>
          // adds (border/background/margin/font/alignment) the same way GOV.UK's
          // own .govuk-accordion__section-button resets its own real button.
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'none',
          border: 0,
          margin: 0,
          padding: '0 0 0 25px',
          font: 'inherit',
          textAlign: 'left',
        }}
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
