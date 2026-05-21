export enum WithdrawalStatus {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface WithdrawalRequest {
    applicationId: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    reason: string;
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
}