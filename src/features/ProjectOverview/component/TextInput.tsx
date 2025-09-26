
import React from 'react';

interface TextInputProps {
	label: string;
	id: string;
	name: string;
	value: string;
	error?: string;
	maxLength?: number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({
	label,
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
		</label>
		{error && (
			<p id={`${id}-error`} className="govuk-error-message">
				<span className="govuk-visually-hidden">Error:</span> {error}
			</p>
		)}
		<input
			className={`govuk-input${error ? ' govuk-input--error' : ''}`}
			id={id}
			name={name}
			type="text"
			value={value}
			maxLength={maxLength}
			onChange={onChange}
			aria-describedby={error ? `${id}-error` : undefined}
		/>
	</div>
);

export default TextInput;
