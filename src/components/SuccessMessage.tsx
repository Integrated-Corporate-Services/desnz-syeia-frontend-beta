import React, { useId } from "react";

interface SuccessMessageProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * GOV.UK success notification banner announced as a status message (WCAG 4.1.3).
 */
const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title = "Success",
  children,
}) => {
  const headingId = useId();

  return (
    <div
      className="govuk-notification-banner govuk-notification-banner--success"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={headingId}
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id={headingId}>
          {title}
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        {typeof children === "string" ? (
          <p className="govuk-notification-banner__heading">{children}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;
