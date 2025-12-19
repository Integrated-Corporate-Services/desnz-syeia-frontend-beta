import React from 'react';

interface SensitiveAreaStatus {
  inProgress: boolean;
  completed: number;
  total: number;
}

interface SensitiveAreaBannerProps {
  status: SensitiveAreaStatus | null;
}

const SensitiveAreaBanner: React.FC<SensitiveAreaBannerProps> = ({ status }) => {
  if (!status || !status.inProgress) return null;
  return (
    <div className="govuk-notification-banner" role="region" aria-labelledby="sensitive-area-title" data-module="govuk-notification-banner" style={{ maxWidth: '640px' }}>
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="sensitive-area-title">
          Sensitive area checks in progress
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-body">
          <strong>{`${status.completed} of ${status.total} checks completed. You can refresh this page to track the progress`}</strong>
        </p>
      </div>
    </div>
  );
};

export default SensitiveAreaBanner;
