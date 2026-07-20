import React from 'react';

interface WithdrawalDecisionBannerProps {
  decision: 'Approved' | 'Rejected';
  decisionDate?: string; // Reserved for future use
  decisionNotes?: string; // Reserved for future use (audit purposes only)
}

export const WithdrawalDecisionBanner: React.FC<WithdrawalDecisionBannerProps> = ({
  decision,
  // decisionDate and decisionNotes intentionally not displayed to end users
}) => {
  const isApproved = decision === 'Approved';

  return (
    <div
      className={`govuk-notification-banner ${
        isApproved 
          ? 'govuk-notification-banner--success' 
          : 'govuk-notification-banner--error'
      }`}
      role="region"
      aria-labelledby="withdrawal-decision-banner-title"
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2
          className="govuk-notification-banner__title"
          id="withdrawal-decision-banner-title"
        >
          {isApproved ? 'Success' : 'Important'}
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <h3 className="govuk-notification-banner__heading">
          {isApproved 
            ? 'Your request to withdraw this application has been approved.'
            : 'Your request to withdraw this application was rejected. Your application\'s status has not changed.'}
        </h3>
      </div>
    </div>
  );
};

interface WithdrawalPendingBannerProps {
  requestedDate?: string; // Reserved for future use
}

export const WithdrawalPendingBanner: React.FC<WithdrawalPendingBannerProps> = () => {
  return (
    <div
      className="govuk-notification-banner"
      role="region"
      aria-labelledby="withdrawal-pending-banner-title"
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header" style={{ backgroundColor: '#1d70b8' }}>
        <h2
          className="govuk-notification-banner__title"
          id="withdrawal-pending-banner-title"
          style={{ color: 'white' }}
        >
          Important
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-notification-banner__heading">
          Your withdrawal request is being reviewed by a case officer. You will be notified when a decision is made.
        </p>
      </div>
    </div>
  );
};
