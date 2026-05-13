import React from 'react';
import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';

export const WithdrawalWarning: React.FC = () => {
    return (
        <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
                !
            </span>
            <strong className="govuk-warning-text__text">
                <span className="govuk-warning-text__assistive">{CONSTANTS.WITHDRAW_PAGE.WARNING_HEADING}</span>
                {CONSTANTS.WITHDRAW_PAGE.WARNING_TEXT}
            </strong>
        </div>
    );
};
