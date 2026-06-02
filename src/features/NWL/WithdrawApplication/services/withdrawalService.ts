import { applicationApiService } from '../../../../services/applicationApiService';

export interface NWLWithdrawalPayload {
    voluntary_agreement: boolean;
    withdrawal_reason: string | null;
}

export interface NWLWithdrawalResponse {
    success: boolean;
    message: string;
    data?: {
        withdrawalRequest?: {
            withdrawal_request_id: string;
            application_id: string;
            voluntary_agreement: boolean;
            withdrawal_reason: string | null;
            request_status: string;
        };
        application?: {
            application_id: string;
            desnz_ref: string;
            type: string;
            status: string;
        };
    };
}

export const submitNWLWithdrawal = async (
    applicationId: string,
    voluntaryAgreement: boolean,
    withdrawalReason?: string
): Promise<NWLWithdrawalResponse> => {
    return applicationApiService.withdrawApplication(
        applicationId,
        voluntaryAgreement,
        withdrawalReason
    );
};
