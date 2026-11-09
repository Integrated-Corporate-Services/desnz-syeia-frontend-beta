import React from 'react';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface WithdrawalNotificationBannerProps {
    message?: string;
    variant?: 'important' | 'success';
}

export const WithdrawalNotificationBanner: React.FC<WithdrawalNotificationBannerProps> = ({
    message = CONSTANTS.REVIEW_LAYOUT.WITHDRAWAL.NOTIFICATION_BANNER,
    variant = 'important',
}) => {
    const isSuccess = variant === 'success';
    return (
        <div
            className={`govuk-notification-banner${isSuccess ? ' govuk-notification-banner--success' : ''}`}
            role={isSuccess ? 'alert' : 'region'}
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
        >
            <div
                className="govuk-notification-banner__header"
                style={isSuccess ? undefined : { backgroundColor: '#1d70b8' }}
            >
                <h2
                    className="govuk-notification-banner__title"
                    id="govuk-notification-banner-title"
                    style={isSuccess ? undefined : { color: 'white' }}
                >
                    {isSuccess ? 'Success' : 'Important'}
                </h2>
            </div>
            <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading">
                    {message}
                </p>
            </div>
        </div>
    );
};
