import React from "react";

interface CheckboxGroupProps {
	isEiaDevelopment: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ isEiaDevelopment, onChange }) => (
	<div className="govuk-form-group">
		<fieldset className="govuk-fieldset">
			<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
				<h2 className="govuk-fieldset__heading">
					Is this project an EIA development?
				</h2>
			</legend>
			<div className="govuk-checkboxes">
				<div className="govuk-checkboxes__item">
					<input
						className="govuk-checkboxes__input"
						id="isEiaDevelopment"
						name="isEiaDevelopment"
						type="checkbox"
						checked={isEiaDevelopment}
						onChange={onChange}
					/>
					<label
						className="govuk-label govuk-checkboxes__label"
						htmlFor="isEiaDevelopment"
					>
						Yes
					</label>
				</div>
			</div>
		</fieldset>
	</div>
);

export default CheckboxGroup;
