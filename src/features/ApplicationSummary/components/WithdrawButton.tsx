import React from 'react';
import { useNavigate } from 'react-router-dom';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface WithdrawButtonProps {
    applicationType: 'NWL' | 'S37' | 'TLP';
    applicationId: string;
    disabled?: boolean;
    onWithdraw?: (applicationType: 'NWL' | 'S37' | 'TLP', applicationId: string) => void;
}

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({
    applicationType,
    applicationId,
    disabled = false,
    onWithdraw,
}) => {
    const navigate = useNavigate();

    const handleWithdraw = () => {
        if (onWithdraw) {
            onWithdraw(applicationType, applicationId);
        } else {
            const withdrawUrl = CONSTANTS.ROUTES.WITHDRAW(applicationType, applicationId);
            navigate(withdrawUrl);
        }
    };

    return (
        <div className="govuk-button-group" style={{ marginTop: '30px', marginBottom: '30px' }}>
            <button
                type="button"
                className="govuk-button govuk-button--warning"
                onClick={handleWithdraw}
                disabled={disabled}
                data-testid="withdraw-button"
            >
                {CONSTANTS.ACTIONS.WITHDRAW}
            </button>
        </div>
    );
};
