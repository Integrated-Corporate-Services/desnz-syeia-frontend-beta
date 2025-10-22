import React from 'react';

interface RouteDeletedBannerProps {
  routeName: string;
}

const RouteDeletedBanner: React.FC<RouteDeletedBannerProps> = ({ routeName }) => (
  <div className="govuk-notification-banner govuk-notification-banner--success" role="alert" aria-labelledby="govuk-notification-banner-title" style={{ marginBottom: 32 }}>
    <div className="govuk-notification-banner__header">
      <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">Route has been deleted</h2>
    </div>
    <div className="govuk-notification-banner__content">
      <p className="govuk-body">{routeName} has been deleted from this application.</p>
      <p className="govuk-body">Some task list sections may now be incomplete as a result.</p>
    </div>
  </div>
);

export default RouteDeletedBanner;
