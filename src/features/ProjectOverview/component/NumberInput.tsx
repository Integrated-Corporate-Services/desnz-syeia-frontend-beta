
import React from 'react';

interface NumberInputProps {
	label: string;
	suffix?: string;
	id: string;
	name: string;
	value: string;
	error?: string;
	maxLength?: number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({
	label,
	suffix,
	id,
	name,
	value,
	error,
	maxLength,
	onChange,
}) => (
	<div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}> 
		<label className="govuk-label" htmlFor={id}>
			{label}
			{suffix && <span className="govuk-visually-hidden">{suffix}</span>}
		</label>
		{error && (
			<p id={`${id}-error`} className="govuk-error-message">
				<span className="govuk-visually-hidden">Error:</span> {error}
			</p>
		)}
		<div className="govuk-input__wrapper">
			<input
				className={`govuk-input govuk-input--width-4${error ? ' govuk-input--error' : ''}`}
				id={id}
				name={name}
				type="number"
				maxLength={maxLength}
				value={value}
				onChange={onChange}
				aria-describedby={error ? `${id}-error` : undefined}
			/>
			{suffix && (
				<div className="govuk-input__suffix" aria-hidden="true">{suffix}</div>
			)}
		</div>
	</div>
);

export default NumberInput;
