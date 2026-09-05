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

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "previous-7-days"
  | "previous-30-days"
  | "last-month"
  | "last-12-months"
  | "custom";

export type MetricValues = Map<string, number>;
export type StatusColour = "grey" | "blue" | "yellow" | "green";