import axios from "axios";

import type { AdminReport } from "../features/reporting/types";
import { getApiUrl } from "../utils/apiConfig";

export type { AdminReport, OrganisationReportRow, ReportMetric } from "../features/reporting/types";

export async function getAdminReport(startDate: string, endDate: string): Promise<AdminReport> {
  const response = await axios.get<AdminReport>(getApiUrl("/admin/reports"), {
    params: { startDate, endDate },
  });

  return response.data;
}