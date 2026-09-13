import axios from "axios";

import type {
  AdminReport,
  ApplicationStatusLookup,
  ReportingAvailability,
  SubmittedApplicationsSummary,
} from "../features/reporting/types";
import { getApiUrl } from "../utils/apiConfig";

export type { AdminReport, OrganisationReportRow, ReportMetric, SubmittedApplicationsSummary } from "../features/reporting/types";

export async function getAdminReport(startDate: string, endDate: string): Promise<AdminReport> {
  const response = await axios.get<AdminReport>(getApiUrl("/admin/reports"), {
    params: { startDate, endDate },
  });

  return response.data;
}

export async function getReportingAvailability(): Promise<ReportingAvailability> {
  const response = await axios.get<ReportingAvailability>(getApiUrl("/admin/reports/availability"));
  return response.data;
}

export async function getApplicationStatusByReference(reference: string): Promise<ApplicationStatusLookup> {
  const response = await axios.get<ApplicationStatusLookup>(getApiUrl("/admin/reports/application-status"), {
    params: { reference },
  });

  return response.data;
}

export async function getSubmittedApplicationsSummary(
  page: number = 1,
  pageSize: number = 20,
  startDate?: string,
  endDate?: string
): Promise<SubmittedApplicationsSummary> {
  const response = await axios.get<SubmittedApplicationsSummary>(getApiUrl("/admin/reports/submitted-applications"), {
    params: { page, pageSize, startDate: startDate || undefined, endDate: endDate || undefined },
  });

  return response.data;
}
