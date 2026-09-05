import type { DateRangePreset, MetricValues, OrganisationReportRow } from "./types";

export const formatNumber = new Intl.NumberFormat("en-GB");
export const formatCurrency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const getPresetDates = (preset: Exclude<DateRangePreset, "custom">) => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  if (preset === "yesterday") { startDate.setDate(startDate.getDate() - 1); endDate.setDate(endDate.getDate() - 1); }
  if (preset === "previous-7-days") startDate.setDate(startDate.getDate() - 6);
  if (preset === "previous-30-days") startDate.setDate(startDate.getDate() - 29);
  if (preset === "last-month") { startDate.setMonth(startDate.getMonth() - 1, 1); endDate.setDate(0); }
  if (preset === "last-12-months") startDate.setFullYear(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate() + 1);
  return { startDate: toIsoDate(startDate), endDate: toIsoDate(endDate) };
};

export const metricValue = (metrics: MetricValues, key: string) => metrics.get(key) || 0;
export const metricTotal = (metrics: MetricValues, ...keys: string[]) => keys.reduce((total, key) => total + metricValue(metrics, key), 0);

const escapeCsvValue = (value: string | number) => {
  const stringValue = String(value);
  const escapedFormula = /^[=+\-@]/.test(stringValue) ? `'${stringValue}` : stringValue;
  return `"${escapedFormula.replaceAll('"', '""')}"`;
};

export const downloadOrganisationCsv = (rows: OrganisationReportRow[], startDate: string, endDate: string) => {
  const headings = ["Organisation", "S37 drafts", "S37 submitted", "NWL drafts", "NWL submitted", "Access requests", "Pending requests"];
  const values = rows.map((row) => [row.organisationName, row.s37Draft, row.s37Submitted, row.nwlDraft, row.nwlSubmitted, row.accessRequests, row.pendingRequests]);
  const csv = [headings, ...values].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `technical-admin-report-${startDate}-to-${endDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};