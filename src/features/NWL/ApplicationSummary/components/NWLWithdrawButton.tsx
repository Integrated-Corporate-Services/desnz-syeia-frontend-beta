/**
 * Withdraw button for NWL application summary (matches S-37 secondary button style).
 */

import React from 'react';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface NWLWithdrawButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const NWLWithdrawButton: React.FC<NWLWithdrawButtonProps> = ({
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
