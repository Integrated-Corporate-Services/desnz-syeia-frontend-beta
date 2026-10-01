import { CONTENT } from '../../../constants/content';
import AccessibleSelect from '../../../components/commonFormFields/AccessibleSelect';
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
    <AccessibleSelect
      id="networkOperator"
      value={value}
      error={!!error}
      required
      aria-describedby={error ? 'networkOperator-error' : undefined}
      options={[
        { value: '', text: 'Select one...' },
        ...options.map(opt => ({ value: opt.organisation_name, text: opt.organisation_name })),
      ]}
      onChange={(newValue) =>
        onChange({ target: { name: 'networkOperator', value: newValue } } as React.ChangeEvent<HTMLSelectElement>)
      }
    />
    {error && (
      <span className="govuk-error-message" id="networkOperator-error">{error}</span>
    )}
  </div>
);

export default NetworkOperatorOrganisationSelect;