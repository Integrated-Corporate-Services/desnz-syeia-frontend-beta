import React, { useState, useRef, useLayoutEffect } from 'react';
import '../styles/Details.css';
import RevealAnnouncement from './commonFormFields/RevealAnnouncement';

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = `details-text-${id}`;
  const [announceText, setAnnounceText] = useState('');

  useLayoutEffect(() => {
    if (isOpen) {
      wrapperRef.current?.setAttribute('open', '');
    } else {
      wrapperRef.current?.removeAttribute('open');
    }
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen) {
      setAnnounceText(contentRef.current?.textContent?.trim() || '');
    }
    setIsOpen(prev => !prev);
  };

  return (
    <div ref={wrapperRef} className={`govuk-details${className ? ` ${className}` : ''}`} style={style}>
      <button
        type="button"
        className="govuk-details__summary"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={toggle}
      >
        <span className="govuk-details__summary-text">{summary}</span>
      </button>
      <RevealAnnouncement shown={isOpen} message={announceText} />
      <div
        ref={contentRef}
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
