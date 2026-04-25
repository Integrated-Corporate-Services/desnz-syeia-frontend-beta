import React from 'react';

interface SensitiveAreaStatus {
  inProgress: boolean;
  completed: number;
  total: number;
  passed?: number;
  cleared?: number;
  failed?: number;
  runStatus?: 'in_progress' | 'completed' | 'partial' | 'failed';
}

interface SensitiveAreaBannerProps {
  status: SensitiveAreaStatus | null;
}

const SensitiveAreaBanner: React.FC<SensitiveAreaBannerProps> = ({ status }) => {
  if (!status || !status.inProgress) return null;

  const passed = status.passed || 0;
  const cleared = status.cleared || 0;
  const failed = status.failed || 0;
  const completed = status.completed || 0;
  const total = status.total || 0;
  
  return (
    <div className="govuk-notification-banner" role="region" aria-labelledby="sensitive-area-title" data-module="govuk-notification-banner">
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="sensitive-area-title">
          Sensitive area checks in progress
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-body">
          <strong>{`${completed} of ${total} layers checked`}</strong>
        </p>
        {/* {(passed > 0 || cleared > 0 || failed > 0) && (
          <p className="govuk-body govuk-!-margin-bottom-2">
            {passed > 0 && <span className="govuk-!-margin-right-4">✓ {passed} intersecting</span>}
            {cleared > 0 && <span className="govuk-!-margin-right-4">✓ {cleared} cleared</span>}
            {failed > 0 && <span className="govuk-error-message">✗ {failed} failed</span>}
          </p>
        )} */}
        {/*<p className="govuk-body govuk-!-margin-bottom-0">
          You can refresh this page to track the progress
        </p>*/}
      </div>
    </div>
  );
};

export default SensitiveAreaBanner;
