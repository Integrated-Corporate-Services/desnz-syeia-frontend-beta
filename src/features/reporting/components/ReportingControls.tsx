import React from "react";
import { DATE_RANGE_OPTIONS, REPORT_SECTION_LINKS } from "../constants";
import { formatReportDate } from "../reportingUtils";
import type { DateRangePreset } from "../types";

interface ReportingFiltersProps {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  loading: boolean;
  availableDateRange: { startDate: string; endDate: string } | null;
  availabilityLoaded: boolean;
  isPresetAvailable: (preset: DateRangePreset) => boolean;
  onPresetChange: (preset: DateRangePreset) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: () => void;
}

export const ReportingFilters: React.FC<ReportingFiltersProps> = ({
  preset,
  startDate,
  endDate,
  loading,
  availableDateRange,
  availabilityLoaded,
  isPresetAvailable,
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}) => (
  <form
    className="reporting-filter-panel"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <fieldset className="govuk-fieldset">
      <legend className="govuk-visually-hidden">Date filters</legend>
      <div className="reporting-filter-row">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="report-range">Date filters</label>
          <select className="govuk-select" id="report-range" value={preset} onChange={(event) => onPresetChange(event.target.value as DateRangePreset)}>
            {DATE_RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value} disabled={option.value === "available-data" ? !availabilityLoaded || !availableDateRange : availabilityLoaded && !isPresetAvailable(option.value)}>{option.label}</option>)}
          </select>
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="report-start-date">Start date</label>
          <input className="govuk-input reporting-date-input" id="report-start-date" type="date" value={startDate} max={endDate || undefined} onChange={(event) => onStartDateChange(event.target.value)} />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="report-end-date">End date</label>
          <input className="govuk-input reporting-date-input" id="report-end-date" type="date" value={endDate} min={startDate || undefined} onChange={(event) => onEndDateChange(event.target.value)} />
        </div>
        <button className="govuk-button reporting-filter-button" type="submit" disabled={loading}>{loading ? "Loading" : "Update"}</button>
      </div>
      {availabilityLoaded && availableDateRange && (
        <p className="govuk-hint reporting-availability" id="reporting-availability">
          Completed reporting data is available from {formatReportDate(availableDateRange.startDate)} to {formatReportDate(availableDateRange.endDate)}.
        </p>
      )}
    </fieldset>
  </form>
);

export const ReportingContents = () => (
  <aside className="govuk-grid-column-one-third reporting-contents" aria-labelledby="contents-heading">
    <h2 className="govuk-heading-m" id="contents-heading">Contents</h2>
    <nav aria-label="Report sections">
      <ul className="reporting-contents__list">
        {REPORT_SECTION_LINKS.map(([id, label]) => (
          <li className="reporting-contents__item" key={id}>
            <a className="reporting-contents__link" href={`#${id}`}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export const TableRegion = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="reporting-table-wrapper" tabIndex={0} role="region" aria-label={`${label}. Scroll horizontally to view all columns.`}>{children}</div>
);
