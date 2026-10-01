import React, { useEffect, useRef, useState } from 'react';

interface RevealAnnouncementProps {
  /** Whether the conditionally revealed content is currently shown. */
  shown: boolean;
  /** What to tell screen reader users when the content appears. */
  message: string;
  /**
   * Announce when content arrives after the first render, such as a fetch.
   * Leave this unset for a radio reveal so a saved answer is not announced.
   */
  announceOnLoad?: boolean;
}

const USER_EVENT_WINDOW_MS = 100;

/**
 * Tells screen reader users that selecting an option revealed more content (WCAG 4.1.3).
 * The GOV.UK pattern sets aria-expanded on the radio, but Chromium-based browsers (Edge, Chrome)
 * do not expose aria-expanded on radios, so the reveal is also announced in a polite live region.
 * Render it unconditionally (outside the conditional block): a live region must exist before its text changes.
 *
 * Saved answers that arrive after the first render are not announced. A radio reveal is announced
 * only after a click or a key press. Click is used rather than pointerdown so a screen reader
 * activation is included, and so holding the pointer down does not let the timer expire early.
 * Pass announceOnLoad when the message itself is the loaded content, such as contact details.
 * While the content stays visible, a changed message is announced as well.
 */
const RevealAnnouncement: React.FC<RevealAnnouncementProps> = ({ shown, message, announceOnLoad = false }) => {
  const [text, setText] = useState('');
  const previous = useRef({ shown, message });
  const fromUser = useRef(false);
  const clearTimer = useRef<number | undefined>(undefined);
  const loadReady = useRef(false);

  useEffect(() => {
    const mark = () => {
      fromUser.current = true;
      window.clearTimeout(clearTimer.current);
      clearTimer.current = window.setTimeout(() => {
        fromUser.current = false;
      }, USER_EVENT_WINDOW_MS);
    };

    document.addEventListener('click', mark, true);
    document.addEventListener('keydown', mark, true);
    return () => {
      document.removeEventListener('click', mark, true);
      document.removeEventListener('keydown', mark, true);
      window.clearTimeout(clearTimer.current);
    };
  }, []);

  useEffect(() => {
    const prev = previous.current;
    previous.current = { shown, message };

    if (!announceOnLoad && !shown) {
      setText('');
    }

    if (announceOnLoad) {
      if (!loadReady.current) {
        loadReady.current = true;
        if (shown) {
          setText(message);
        }
        return;
      }
    } else if (!fromUser.current) {
      return;
    } else {
      fromUser.current = false;
      window.clearTimeout(clearTimer.current);
    }

    if (!shown) {
      setText('');
      return;
    }

    const becameVisible = !prev.shown;
    const messageChanged = prev.message !== message;
    if (becameVisible || messageChanged) {
      setText(message);
    }
  }, [shown, message, announceOnLoad]);

  return (
    <div className="govuk-visually-hidden" role="status" aria-live="polite">
      {text}
    </div>
  );
};

export default RevealAnnouncement;
