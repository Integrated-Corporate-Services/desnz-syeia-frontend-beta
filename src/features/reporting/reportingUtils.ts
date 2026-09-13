import type { DateRangePreset, MetricValues, OrganisationReportRow } from "./types";

export const formatNumber = new Intl.NumberFormat("en-GB");
export const formatCurrency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const getPresetDates = (preset: Exclude<DateRangePreset, "custom" | "available-data">) => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  if (preset !== "today") endDate.setDate(endDate.getDate() - 1);
  if (preset === "yesterday") startDate.setTime(endDate.getTime());
  if (preset === "previous-7-days") startDate.setDate(endDate.getDate() - 6);
  if (preset === "previous-30-days") startDate.setDate(endDate.getDate() - 29);
  if (preset === "last-month") { startDate.setMonth(startDate.getMonth() - 1, 1); endDate.setDate(0); }
  if (preset === "last-12-months") startDate.setFullYear(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate() + 1);
  return { startDate: toIsoDate(startDate), endDate: toIsoDate(endDate) };
};

export const isDateRangeAvailable = (startDate: string, endDate: string, availableDates: string[]) => {
  const completedDates = new Set(availableDates);
  const currentDate = new Date(`${startDate}T00:00:00Z`);
  const finalDate = new Date(`${endDate}T00:00:00Z`);
  while (currentDate <= finalDate) {
    if (!completedDates.has(toIsoDate(currentDate))) return false;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  return true;
};

export const getLatestAvailableDateRange = (availableDates: string[]) => {
  if (availableDates.length === 0) return null;

  const completedDates = new Set(availableDates);
  const endDate = [...completedDates].sort().at(-1)!;
  const currentDate = new Date(`${endDate}T00:00:00Z`);

  while (true) {
    const previousDate = new Date(currentDate);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    if (!completedDates.has(toIsoDate(previousDate))) break;
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }

  return { startDate: toIsoDate(currentDate), endDate };
};

export const formatReportDate = (date: string) => new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${date}T00:00:00Z`));

export const formatDateTime = (isoDateTime: string): string => new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Europe/London",
}).format(new Date(isoDateTime));

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