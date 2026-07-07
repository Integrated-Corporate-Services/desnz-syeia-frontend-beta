
import React from 'react';

interface TextAreaProps {
	label: string;
	id: string;
	name: string;
	value: string;
	error?: string;
	maxLength?: number;
	hint?: string;
	infoId?: string;
	remainingChars?: number;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea: React.FC<TextAreaProps> = ({
	label,
	id,
	name,
	value,
	error,
	maxLength,
	hint,
	infoId,
	remainingChars,
	onChange,
}) => (
	<div className={`govuk-form-group govuk-character-count${error ? ' govuk-form-group--error' : ''}`} data-module="govuk-character-count" data-maxlength={maxLength}>
		<label className="govuk-label" htmlFor={id}>
			{label}
		</label>
		{hint && <div className="govuk-hint">{hint}</div>}
		{error && (
			<p id={`${id}-error`} className="govuk-error-message">
				<span className="govuk-visually-hidden">Error:</span> {error}
			</p>
		)}
		<textarea
			className={`govuk-textarea govuk-js-character-count${error ? ' govuk-textarea--error' : ''}`}
			id={id}
			name={name}
			rows={5}
			maxLength={maxLength}
			value={value}
			onChange={onChange}
			aria-describedby={error ? `${id}-error ${infoId}` : infoId}
		></textarea>
		{infoId && (
			<div id={infoId} className="govuk-hint govuk-character-count__message govuk-visually-hidden">You can enter up to {maxLength} characters</div>
		)}
		{typeof remainingChars === 'number' && (
			<div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">You have {remainingChars} characters remaining</div>
		)}
		{typeof remainingChars === 'number' && (
			<div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">You have {remainingChars} characters remaining</div>
		)}
	</div>
);

export default TextArea;
