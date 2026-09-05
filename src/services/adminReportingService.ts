import axios from "axios";

import type { AdminReport } from "../features/reporting/types";

export type { AdminReport, OrganisationReportRow, ReportMetric } from "../features/reporting/types";

export async function getAdminReport(startDate: string, endDate: string): Promise<AdminReport> {
  const response = await axios.get<AdminReport>("/backend/api/admin/reports", {
    params: { startDate, endDate },
  });

  return response.data;
}