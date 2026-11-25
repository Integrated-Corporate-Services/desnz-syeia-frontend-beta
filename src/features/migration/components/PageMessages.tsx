import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { MIGRATION_CONTENT, MIGRATION_ERRORS } from '../constants';

/** Full-page "not found" content for a missing batch or application. */
export const MigrationNotFound: React.FC<{ heading: string; body?: string; linkTo: string; linkText: string }> = ({
  heading,
  body,
  linkTo,
  linkText,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="govuk-grid-row">
      <PageTitle title={heading} />
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-l" ref={headingRef} tabIndex={-1}>
          {heading}
        </h1>
        {body && <p className="govuk-body">{body}</p>}
        <p className="govuk-body">
          <Link className="govuk-link" to={linkTo}>
            {linkText}
          </Link>
        </p>
      </div>
    </div>
  );
};

/** GOV.UK "Sorry, there is a problem with the service" page content. */
export const ServiceProblem: React.FC<{ message?: string }> = ({ message = MIGRATION_ERRORS.SERVICE }) => (
  <div className="govuk-grid-row">
    <PageTitle title="Sorry, there is a problem with the service" />
    <div className="govuk-grid-column-two-thirds">
      <h1 className="govuk-heading-l">Sorry, there is a problem with the service</h1>
      <p className="govuk-body" role="alert">
        {message === MIGRATION_ERRORS.SERVICE ? 'Try again later.' : message}
      </p>
    </div>
  </div>
);

export const SuccessBanner: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="govuk-notification-banner govuk-notification-banner--success"
    role="alert"
    aria-labelledby="migration-success-title"
    data-module="govuk-notification-banner"
  >
    <div className="govuk-notification-banner__header">
      <h2 className="govuk-notification-banner__title" id="migration-success-title">
        {MIGRATION_CONTENT.SUCCESS_TITLE}
      </h2>
    </div>
    <div className="govuk-notification-banner__content">
      <p className="govuk-notification-banner__heading">{message}</p>
    </div>
  </div>
);

/** Announced to screen readers while data loads. */
export const LoadingMessage: React.FC = () => (
  <p className="govuk-body" role="status" aria-live="polite">
    {MIGRATION_CONTENT.LOADING}
  </p>
);
