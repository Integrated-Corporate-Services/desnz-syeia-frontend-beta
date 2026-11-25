import React from 'react';
import { MIGRATION_CONTENT } from '../constants';
import type { NwlApplicationFullData } from '../types';
import { humaniseCode } from '../utils/format';

/**
 * Read-only view of getNWLApplicationFullData.
 *
 * The NWL Check your answers cards expect the /review endpoint's section shape
 * (applicantDetails, noticeCompliance, landownerDetails ...), not the raw service shape the
 * migration API returns, so this renders each section as GOV.UK summary cards instead.
 * TODO: switch to the NWL summary cards (canEdit=false) if the API starts returning review sections.
 */

const SECTION_TITLES: Record<string, string> = {
  application: 'Application',
  applicationDetails: 'Application details',
  objectorDetails: 'Owner and occupier details',
  landDetails: 'Land details',
  assets: 'Assets',
  negotiations: 'Negotiations',
  additionalInformation: 'Additional information',
  payment: 'Payment',
};

const SECTION_ORDER = Object.keys(SECTION_TITLES);
const MAX_DEPTH = 3;

type Primitive = string | number | boolean | null | undefined;

const isPrimitive = (value: unknown): value is Primitive =>
  value === null || value === undefined || ['string', 'number', 'boolean'].includes(typeof value);

const formatValue = (value: Primitive): string => {
  if (value === null || value === undefined || value === '') return MIGRATION_CONTENT.NOT_PROVIDED;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const isEmpty = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0);

const SummaryRows: React.FC<{ data: Record<string, unknown>; depth: number }> = ({ data, depth }) => {
  const entries = Object.entries(data);
  const primitives = entries.filter(([, value]) => isPrimitive(value)) as Array<[string, Primitive]>;
  const nested = entries.filter(([, value]) => !isPrimitive(value) && !isEmpty(value));

  return (
    <>
      {primitives.length > 0 && (
        <dl className="govuk-summary-list">
          {primitives.map(([key, value]) => (
            <div className="govuk-summary-list__row" key={key}>
              <dt className="govuk-summary-list__key">{humaniseCode(key)}</dt>
              <dd className="govuk-summary-list__value">{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
      {depth < MAX_DEPTH &&
        nested.map(([key, value]) => (
          <SectionValue key={key} title={humaniseCode(key)} value={value} depth={depth + 1} />
        ))}
    </>
  );
};

const SectionValue: React.FC<{ title: string; value: unknown; depth: number }> = ({ title, value, depth }) => {
  const Heading = depth <= 1 ? 'h3' : 'h4';
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((item, index) => (
          <SectionValue key={index} title={`${title} ${index + 1}`} value={item} depth={depth} />
        ))}
      </>
    );
  }
  if (isPrimitive(value)) {
    return (
      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{title}</dt>
          <dd className="govuk-summary-list__value">{formatValue(value)}</dd>
        </div>
      </dl>
    );
  }
  return (
    <div className="govuk-summary-card">
      <div className="govuk-summary-card__title-wrapper">
        <Heading className="govuk-summary-card__title">{title}</Heading>
      </div>
      <div className="govuk-summary-card__content">
        <SummaryRows data={value as Record<string, unknown>} depth={depth} />
      </div>
    </div>
  );
};

const ApplicationDataSummary: React.FC<{ data: NwlApplicationFullData | null }> = ({ data }) => {
  if (!data) return <p className="govuk-body">{MIGRATION_CONTENT.NOT_AVAILABLE}</p>;

  const keys = [
    ...SECTION_ORDER.filter((key) => key in data),
    ...Object.keys(data).filter((key) => !SECTION_ORDER.includes(key)),
  ].filter((key) => !isEmpty(data[key]));

  return (
    <div className="migration-application-data">
      {keys.map((key) => (
        <SectionValue key={key} title={SECTION_TITLES[key] || humaniseCode(key)} value={data[key]} depth={1} />
      ))}
    </div>
  );
};

export default ApplicationDataSummary;
