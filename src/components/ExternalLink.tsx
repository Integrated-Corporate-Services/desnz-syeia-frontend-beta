/**
 * ExternalLink Component
 * 
 * Security-enhanced component for displaying external links with:
 * - Safety checking before display
 * - Visual warnings for suspicious links
 * - Logging of link clicks
 * - Blocked link prevention
 */

import React, { useState } from 'react';
import {
  checkLinkSafety,
  logLinkClick,
  LinkSafetyLevel,
  getWarningMessage,
  isExternalUrl,
  sanitizeUrlForDisplay,
} from '../utils/linkChecker';
import { useAuthUser } from '../hooks/useAuthUser';

interface ExternalLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  /** Context for logging (e.g., 'consultation-evidence', 'feedback-url') */
  context?: string;
  /** If true, show warning inline. If false, block suspicious links */
  allowSuspicious?: boolean;
  /** Display the URL if no children provided */
  showUrl?: boolean;
  /** Override default link text */
  'aria-label'?: string;
}

/**
 * Safe external link component with reputation checking
 */
export const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  className = 'govuk-link',
  context,
  allowSuspicious = true,
  showUrl = false,
  'aria-label': ariaLabel,
}) => {
  const { user } = useAuthUser();
  const [showWarningDetail, setShowWarningDetail] = useState(false);

  // Check link safety
  const checkResult = checkLinkSafety(href);
  const warningMessage = getWarningMessage(checkResult.safetyLevel);
  const external = isExternalUrl(href);

  // Determine display content
  const displayContent = children || (showUrl ? sanitizeUrlForDisplay(href) : href);

  // Handle link click
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Log the click
    logLinkClick(href, context, user?.email);

    // Block if link is blocked
    if (checkResult.safetyLevel === LinkSafetyLevel.BLOCKED) {
      e.preventDefault();
      alert('This link has been blocked for security reasons and cannot be opened.');
      return;
    }

    // Warn for suspicious links
    if (checkResult.safetyLevel === LinkSafetyLevel.SUSPICIOUS && !allowSuspicious) {
      e.preventDefault();
      const proceed = confirm(
        'This link may not be safe. It has characteristics commonly associated with phishing or malware sites.\n\n' +
        `URL: ${sanitizeUrlForDisplay(href)}\n\n` +
        'Do you want to proceed anyway?'
      );
      if (proceed) {
        logLinkClick(href, `${context}-suspicious-confirmed`, user?.email);
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // For invalid URLs, don't render a link
  if (checkResult.safetyLevel === LinkSafetyLevel.INVALID) {
    return (
      <span className="govuk-body" style={{ color: '#d4351c' }}>
        {displayContent}
        <span className="govuk-visually-hidden"> (invalid link)</span>
      </span>
    );
  }

  // For blocked URLs, show as disabled text with warning
  if (checkResult.safetyLevel === LinkSafetyLevel.BLOCKED) {
    return (
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-warning-text__assistive">Warning</span>
          {displayContent}
          <br />
          <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
            This link has been blocked as potentially malicious and cannot be opened.
          </span>
        </strong>
      </div>
    );
  }

  return (
    <div className="external-link-container">
      <a
        href={checkResult.normalizedUrl || href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={ariaLabel || (external ? `${displayContent} (opens in new tab)` : undefined)}
      >
        {displayContent}
        {external && (
          <span className="govuk-visually-hidden"> (opens in new tab)</span>
        )}
      </a>

      {/* Warning for suspicious links */}
      {checkResult.safetyLevel === LinkSafetyLevel.SUSPICIOUS && (
        <div 
          className="govuk-inset-text" 
          style={{ 
            marginTop: '10px', 
            borderLeftColor: '#f47738',
            backgroundColor: '#fff7f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span 
              style={{ 
                marginRight: '8px', 
                fontSize: '24px',
                color: '#f47738',
              }}
              aria-hidden="true"
            >
              ⚠️
            </span>
            <div style={{ flex: 1 }}>
              <strong>Caution:</strong> {warningMessage}
              <br />
              <button
                type="button"
                className="govuk-link"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginTop: '5px',
                }}
                onClick={() => setShowWarningDetail(!showWarningDetail)}
              >
                {showWarningDetail ? 'Hide details' : 'Why is this flagged?'}
              </button>
              {showWarningDetail && (
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  <p className="govuk-body-s" style={{ marginBottom: '5px' }}>
                    This link has been flagged because:
                  </p>
                  <ul className="govuk-list govuk-list--bullet govuk-body-s">
                    <li>It contains patterns commonly used in phishing attacks</li>
                    <li>The URL structure appears suspicious</li>
                    <li>It is not from a known trusted domain</li>
                  </ul>
                  <p className="govuk-body-s">
                    Only click this link if you are certain it is legitimate and you trust the source.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple external link wrapper for cases where reputation checking isn't needed
 * (e.g., links to known government sites)
 */
export const TrustedExternalLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className = 'govuk-link' }) => {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="govuk-visually-hidden"> (opens in new tab)</span>
    </a>
  );
};

export default ExternalLink;
