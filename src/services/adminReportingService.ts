import axios from "axios";

import type { AdminReport, ReportingAvailability, ReportingJob } from "../features/reporting/types";
import { getApiUrl } from "../utils/apiConfig";

export type { AdminReport, OrganisationReportRow, ReportMetric } from "../features/reporting/types";

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

export async function createReportingJob(startDate: string, endDate: string): Promise<ReportingJob> {
  const response = await axios.post<ReportingJob>(getApiUrl('/admin/reporting-jobs'), { startDate, endDate });
  return response.data;
}
