import { CONTENT } from '../../../constants/content';
const NetworkOperatorOrganisationSelect = ({
  options,
  value,
  onChange,
  error,
}: {
  options: any[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}) => (
  <div className="govuk-form-group">
    <label className="govuk-label" htmlFor="networkOperator" id="selector-networkOperator-label">
      {CONTENT.networkOperator.organisationLabel}
    </label>
    <div id="networkOperator-hint" className="govuk-hint">
      {CONTENT.networkOperator.organisationHint}
    </div>
    <select
      id="networkOperator"
      name="networkOperator"
      className="govuk-select"
      style={{ width: '100%' }}
      value={value}
      onChange={onChange}
      aria-invalid={!!error}
      aria-describedby={error ? 'networkOperator-error' : undefined}
      required
    >
      <option value="" disabled>Select one...</option>
      {options.map(opt => (
        <option key={opt.organisation_id || opt.organisation_name} value={opt.organisation_name}>{opt.organisation_name}</option>
      ))}
    </select>
    {error && (
      <span className="govuk-error-message" id="networkOperator-error">{error}</span>
    )}
  </div>
);

export default NetworkOperatorOrganisationSelect;