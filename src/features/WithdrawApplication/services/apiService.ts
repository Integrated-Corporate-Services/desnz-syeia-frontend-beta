import axios from 'axios';
import { WithdrawalRequest, WithdrawalResponse } from '../types';
import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';

export const submitWithdrawal = async (request: WithdrawalRequest): Promise<WithdrawalResponse> => {
    try {
        const response = await axios.post(
            `/backend/api/applications/${request.applicationId}/withdraw`,
            {
                application_type: request.applicationType,
                withdrawal_reason: request.reason,
                additional_comments: request.additionalComments || null,
                requested_by: request.requestedBy,
            }
        );

        return {
            success: true,
            withdrawalId: response.data.withdrawal_id,
            message: response.data.message || 'Application withdrawn successfully',
            desnzRef: response.data.desnz_ref || response.data.reference_number,
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.error 
            || error.response?.data?.message 
            || error.message 
            || 'Failed to withdraw application';
        throw new Error(errorMessage);
    }
};

export const getWithdrawalReasons = (
    applicationType: 'NWL' | 'S37' | 'TLP'
): Array<{ value: string; label: string }> => {
    return CONSTANTS.REASONS[applicationType] || CONSTANTS.REASONS.NWL;
};