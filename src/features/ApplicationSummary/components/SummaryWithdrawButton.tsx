import React from 'react';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { useApplicationReadOnly } from '../../../hooks/usePreventEditSubmitted';
import type { AuthUser } from '../../../types/auth';

interface SummaryWithdrawButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const SummaryWithdrawButton: React.FC<SummaryWithdrawButtonProps> = ({
    onClick,
    disabled = false,
}) => {
    const { user } = useAuthUserContext();
    const isPolicyReadOnly = useApplicationReadOnly(undefined, user as AuthUser);
    if (isPolicyReadOnly) return null;

    return (
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
    );
};
