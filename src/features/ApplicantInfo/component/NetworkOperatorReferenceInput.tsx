const NetworkOperatorReferenceInput = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => (
  <div className="govuk-form-group">
    <label className="govuk-label" htmlFor="networkOperatorReference-inputValue">
      Network operator's reference
    </label>
    <input
      className="govuk-input"
      id="networkOperatorReference-inputValue"
      name="networkOperatorReference.inputValue"
      type="text"
      value={value}
      maxLength={4000}
      onChange={onChange}
      style={{ width: '100%' }}
      aria-invalid={!!error}
      aria-describedby={error ? 'networkOperatorReference-error' : undefined}
    />
    {error && (
      <span className="govuk-error-message" id="networkOperatorReference-error">{error}</span>
    )}
  </div>
);

export default NetworkOperatorReferenceInput;