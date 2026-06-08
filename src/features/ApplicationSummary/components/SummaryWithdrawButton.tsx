import React from 'react';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface SummaryWithdrawButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

/** Secondary withdraw button (matches S-37 application summary). */
export const SummaryWithdrawButton: React.FC<SummaryWithdrawButtonProps> = ({
    onClick,
    disabled = false,
}) => {
    return (
        <div className="govuk-button-group">
            <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={onClick}
                disabled={disabled}
                data-testid="withdraw-button"
            >
                {CONSTANTS.ACTIONS.WITHDRAW_APPLICATION}
            </button>
        </div>
    );
};
