/**
 * Banner shown when a withdrawal request is pending review (matches S-37 application summary).
 */

import React from 'react';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

export const WithdrawalNotificationBanner: React.FC = () => {
    return (
        <div
            className="govuk-notification-banner"
            role="region"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
        >
            <div
                className="govuk-notification-banner__header"
                style={{ backgroundColor: '#1d70b8' }}
            >
                <h2
                    className="govuk-notification-banner__title"
                    id="govuk-notification-banner-title"
                    style={{ color: 'white' }}
                >
                    Important
                </h2>
            </div>
            <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading">
                    {CONSTANTS.WITHDRAWAL.NOTIFICATION_BANNER}
                </p>
            </div>
        </div>
    );
};
