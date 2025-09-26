
import React from 'react';

interface RadioOption {
	value: string;
	label: string;
	conditionalRender?: React.ReactNode;
}

interface RadioGroupProps {
	id: string;
	name: string;
	legend: string;
	hint?: string;
	options: RadioOption[];
	value: string;
	error?: string;
	onChange: (value: string) => void;
	ariaControls?: string[];
}

const RadioGroup: React.FC<RadioGroupProps> = ({
	id,
	name,
	legend,
	hint,
	options,
	value,
	error,
	onChange,
	ariaControls,
}) => (
	<div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}> 
		<fieldset className="govuk-fieldset" aria-describedby={hint ? `${id}-hint${error ? ` ${id}-error` : ''}`.trim() : error ? `${id}-error` : undefined}>
			<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
				<h2 className="govuk-fieldset__heading">{legend}</h2>
			</legend>
			{hint && (
				<div className="govuk-hint" id={`${id}-hint`}>
					{hint}
				</div>
			)}
			{error && (
				<p id={`${id}-error`} className="govuk-error-message">
					<span className="govuk-visually-hidden">Error:</span> {error}
				</p>
			)}
			<div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
				{options.map((opt, idx) => (
					<React.Fragment key={opt.value}>
						<div className="govuk-radios__item">
							<input
								className="govuk-radios__input"
								id={idx === 0 ? id : `${id}-${opt.value}`}
								name={name}
								type="radio"
								value={opt.value}
								checked={value === opt.value}
								onChange={() => onChange(opt.value)}
								aria-controls={ariaControls && ariaControls[idx] ? ariaControls[idx] : undefined}
								aria-expanded={opt.conditionalRender ? (value === opt.value ? 'true' : 'false') : undefined}
							/>
							<label className="govuk-label govuk-radios__label" htmlFor={idx === 0 ? id : `${id}-${opt.value}`}>{opt.label}</label>
						</div>
						{opt.conditionalRender && value === opt.value && (
							<div className="govuk-radios__conditional" id={ariaControls && ariaControls[idx] ? ariaControls[idx] : `${id}-hidden`}>
								{opt.conditionalRender}
							</div>
						)}
					</React.Fragment>
				))}
			</div>
		</fieldset>
	</div>
);

export default RadioGroup;
