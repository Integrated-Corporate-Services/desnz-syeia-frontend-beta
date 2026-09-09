export interface ReportMetric {
  key: string;
  label: string;
  value: number;
}

export interface OrganisationReportRow {
  organisationName: string;
  s37Draft: number;
  s37Submitted: number;
  nwlDraft: number;
  nwlSubmitted: number;
  accessRequests: number;
  pendingRequests: number;
}

export interface AdminReport {
  startDate: string;
  endDate: string;
  timezone: string;
  generatedAt: string;
  metrics: ReportMetric[];
  organisations: OrganisationReportRow[];
}

export interface ReportingAvailability {
  availableDates: string[];
}

export interface ApplicationPaymentSummary {
  paymentId: string | null;
  status: string | null;
  amount: number | null;
  reference: string | null;
  provider: string | null;
}

export interface ApplicationStatusLookup {
  applicationId: string;
  desnzRef: string | null;
  applicationStatus: string;
  startedAt: string;
  payment: ApplicationPaymentSummary | null;
  canVerifyPayment: boolean;
}

export interface ReconciliationResult {
  applicationId: string;
  applicationStatus: string;
  paymentId: string | null;
  paymentStatus: string | null;
  submitted: boolean;
  message: string;
}

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "previous-7-days"
  | "previous-30-days"
  | "last-month"
  | "last-12-months"
  | "available-data"
  | "custom";

export type MetricValues = Map<string, number>;
export type StatusColour = "grey" | "blue" | "yellow" | "green";