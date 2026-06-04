import { applicationApiService } from '../../../../services/applicationApiService';

/** @deprecated Prefer applicationApiService.withdrawApplication (used by shared withdraw page). */
export const submitNWLWithdrawal = (
    applicationId: string,
    voluntaryAgreement: boolean,
    withdrawalReason?: string
) => applicationApiService.withdrawApplication(applicationId, voluntaryAgreement, withdrawalReason);
