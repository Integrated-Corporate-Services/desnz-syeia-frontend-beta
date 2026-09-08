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

export interface ReportingJob {
  reportingJobId: string;
  startDate: string;
  endDate: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  ecsTaskArn: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface ReportingAvailability {
  availableDates: string[];
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