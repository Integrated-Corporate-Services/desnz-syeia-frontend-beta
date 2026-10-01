import React, { useEffect, useRef, useState } from 'react';

interface RevealAnnouncementProps {
  /** Whether the conditionally revealed content is currently shown. */
  shown: boolean;
  /** What to tell screen reader users when the content appears. */
  message: string;
}

const USER_EVENT_WINDOW_MS = 100;

/**
 * Tells screen reader users that selecting an option revealed more content (WCAG 4.1.3).
 * The GOV.UK pattern sets aria-expanded on the radio, but Chromium-based browsers (Edge, Chrome)
 * do not expose aria-expanded on radios, so the reveal is also announced in a polite live region.
 * Render it unconditionally (outside the conditional block): a live region must exist before its text changes.
 *
 * Saved answers that arrive after the first render (for example a fetch that fills the form) are not
 * announced. Only a change that follows a click or key press is announced. While the content stays
 * visible, a changed message is announced as well, so a count or selected name does not go stale.
 */
const RevealAnnouncement: React.FC<RevealAnnouncementProps> = ({ shown, message }) => {
  const [text, setText] = useState('');
  const previous = useRef({ shown, message });
  const fromUser = useRef(false);
  const clearTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mark = () => {
      fromUser.current = true;
      window.clearTimeout(clearTimer.current);
      clearTimer.current = window.setTimeout(() => {
        fromUser.current = false;
      }, USER_EVENT_WINDOW_MS);
    };

    document.addEventListener('pointerdown', mark, true);
    document.addEventListener('keydown', mark, true);
    return () => {
      document.removeEventListener('pointerdown', mark, true);
      document.removeEventListener('keydown', mark, true);
      window.clearTimeout(clearTimer.current);
    };
  }, []);

  useEffect(() => {
    const prev = previous.current;
    previous.current = { shown, message };

    if (!fromUser.current) return;
    fromUser.current = false;
    window.clearTimeout(clearTimer.current);

    if (!shown) {
      setText('');
      return;
    }

    const becameVisible = !prev.shown;
    const messageChanged = prev.message !== message;
    if (becameVisible || messageChanged) {
      setText(message);
    }
  }, [shown, message]);

  return (
    <div className="govuk-visually-hidden" role="status" aria-live="polite">
      {text}
    </div>
  );
};

export default RevealAnnouncement;
