import React, { useState, useRef, useLayoutEffect } from 'react';
import '../styles/Details.css';

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
 *
 * Native button chrome (border/background/font) is reset in ../styles/Details.css,
 * not inline - GOV.UK has no utility class for this (its own Details component
 * never needs it, since a native <summary> has no default button styling).
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
