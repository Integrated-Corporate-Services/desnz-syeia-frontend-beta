export interface NWLWithdrawalRequest {
    withdrawal_request_id: string;
    request_status: string;
    voluntary_agreement?: boolean;
    withdrawal_reason?: string | null;
    requested_at?: string;
}
