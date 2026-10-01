import React, { useEffect, useRef, useState } from 'react';

interface RevealAnnouncementProps {
  /** Whether the conditionally revealed content is currently shown. */
  shown: boolean;
  /** What to tell screen reader users when the content appears. */
  message: string;
}

/**
 * Tells screen reader users that selecting an option revealed more content (WCAG 4.1.3).
 * The GOV.UK pattern sets aria-expanded on the radio, but Chromium-based browsers (Edge, Chrome)
 * do not expose aria-expanded on radios, so the reveal is also announced in a polite live region.
 * Render it unconditionally (outside the conditional block): a live region must exist before its text changes.
 * Only changes after the page has loaded are announced, not the state the page loaded with.
 */
const RevealAnnouncement: React.FC<RevealAnnouncementProps> = ({ shown, message }) => {
  const [text, setText] = useState('');
  const previous = useRef(shown);

  useEffect(() => {
    if (previous.current === shown) return;
    previous.current = shown;
    setText(shown ? message : '');
  }, [shown, message]);

  return (
    <div className="govuk-visually-hidden" role="status" aria-live="polite">
      {text}
    </div>
  );
};

export default RevealAnnouncement;
