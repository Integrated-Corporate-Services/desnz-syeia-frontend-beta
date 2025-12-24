export interface EiaFees {
  eiaFeeId?: string;
  eiaId?: string;
  applicationId: string;
  requiresFullEia: boolean;
  screeningOnly: boolean;
  createdAt?: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy: string;
}