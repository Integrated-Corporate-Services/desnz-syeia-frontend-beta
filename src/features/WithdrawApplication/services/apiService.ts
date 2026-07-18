import { WithdrawalRequest, WithdrawalResponse } from '../types';
import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';
import { getCsrfToken, fetchCsrfToken, getCsrfHeaders } from '../../../utils/csrf';

export const submitWithdrawal = async (request: WithdrawalRequest): Promise<WithdrawalResponse> => {
    try {
        let token = getCsrfToken();
        if (!token) {
            token = await fetchCsrfToken();
        }
        
        const response = await fetch(
            `/api/applications/${request.applicationId}/withdraw`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getCsrfHeaders(),
                },
                credentials: 'include',
                body: JSON.stringify({
                    application_type: request.applicationType,
                    withdrawal_reason: request.reason,
                    additional_comments: request.additionalComments || null,
                    requested_by: request.requestedBy,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
            );
        }

        const data = await response.json();

        return {
            success: true,
            withdrawalId: data.withdrawal_id,
            message: data.message || 'Application withdrawn successfully',
            desnzRef: data.desnz_ref || data.reference_number,
        };
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to withdraw application';
        throw new Error(errorMessage);
    }
};

export const getWithdrawalReasons = (
    applicationType: 'NWL' | 'S37' | 'TLP'
): Array<{ value: string; label: string }> => {
    return CONSTANTS.REASONS[applicationType] || CONSTANTS.REASONS.NWL;
};