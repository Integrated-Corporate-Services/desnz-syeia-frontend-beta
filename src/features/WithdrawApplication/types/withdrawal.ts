export enum WithdrawalStatus {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface WithdrawalRequest {
    applicationId: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    reason: string;
    voluntaryAgreement?: boolean; // Required for NWL and TLP, not applicable for S37
    additionalComments?: string;
    requestedBy: string;
    requestedDate: string;
}

export interface WithdrawalResponse {
    success: boolean;
    withdrawalId?: string;
    message: string;
    desnzRef?: string;
}

export interface WithdrawalConfirmationData {
    withdrawalId: string;
    applicationId: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    desnzRef?: string;
    withdrawnDate: string;
    reason: string;
    voluntaryAgreement?: boolean;
}
