type DateInputProps = {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

const DateInput = ({ id, label, value = '', onChange, disabled, error }: DateInputProps) => {
  const parts = value.split('-');
  return <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    <fieldset className="govuk-fieldset" aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} disabled={disabled}>
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">{label}</legend>
      <div className="govuk-hint" id={`${id}-hint`}>For example, 27 3 2026</div>
      {error && <p className="govuk-error-message" id={`${id}-error`}><span className="govuk-visually-hidden">Error:</span> {error}</p>}
      <div className="govuk-date-input" id={id}>{[{ name: 'Day', index: 2, width: 2 }, { name: 'Month', index: 1, width: 2 }, { name: 'Year', index: 0, width: 4 }].map((part) => <div className="govuk-date-input__item" key={part.name}>
        <div className="govuk-form-group"><label className="govuk-label govuk-date-input__label" htmlFor={`${id}-${part.name.toLowerCase()}`}>{part.name}</label>
          <input className={`govuk-input govuk-date-input__input govuk-input--width-${part.width}${error ? ' govuk-input--error' : ''}`} id={`${id}-${part.name.toLowerCase()}`} name={`${id}-${part.name.toLowerCase()}`} type="text" inputMode="numeric" maxLength={part.width} value={(parts[part.index] || '').replace(/^0(?=\d)/, '')} onChange={(event) => {
            const next = [parts[0] || '', parts[1] || '', parts[2] || '']; next[part.index] = event.target.value.replace(/\D/g, '');
            onChange(next.every((item) => !item) ? '' : `${next[0]}-${next[1] ? next[1].padStart(2, '0') : ''}-${next[2] ? next[2].padStart(2, '0') : ''}`);
          }} />
        </div></div>)}</div>
    </fieldset>
  </div>;
};

export default DateInput;