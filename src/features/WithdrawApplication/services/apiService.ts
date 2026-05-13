import { WithdrawalRequest, WithdrawalResponse } from '../types';
import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';

export const submitWithdrawal = async (request: WithdrawalRequest): Promise<WithdrawalResponse> => {
    const response = await fetch(`/backend/api/applications/${request.applicationId}/withdraw`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            application_type: request.applicationType,
            withdrawal_reason: request.reason,
            additional_comments: request.additionalComments || null,
            requested_by: request.requestedBy,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to withdraw application' }));
        throw new Error(errorData.error || errorData.message || 'Failed to withdraw application');
    }

    const data = await response.json();

    return {
        success: true,
        withdrawalId: data.withdrawal_id,
        message: data.message || 'Application withdrawn successfully',
        desnzRef: data.desnz_ref || data.reference_number,
    };
};

export const getWithdrawalReasons = (
    applicationType: 'NWL' | 'S37' | 'TLP'
): Array<{ value: string; label: string }> => {
    return CONSTANTS.REASONS[applicationType] || CONSTANTS.REASONS.NWL;
};
