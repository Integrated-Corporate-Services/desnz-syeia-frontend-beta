import React from "react";

interface RadioGroupProps {
	isEiaDevelopment: string;
	confirmedEiaFee: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


const RadioGroup: React.FC<RadioGroupProps> = ({
	isEiaDevelopment,
	confirmedEiaFee,
	onChange,
}) => (
	<div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
		<div className="govuk-radios__item">
			<input
				className="govuk-radios__input"
				id="isEiaDevelopment"
				name="isEiaDevelopment"
				type="radio"
				value="true"
				checked={isEiaDevelopment === "true"}
				aria-controls="isEiaDevelopment-hidden"
				aria-expanded={isEiaDevelopment === "true"}
				onChange={onChange}
			/>
			<label className="govuk-label govuk-radios__label" htmlFor="isEiaDevelopment">
				Yes
			</label>
		</div>
		{isEiaDevelopment === "true" && (
			<div className="govuk-radios__conditional" id="isEiaDevelopment-hidden">
				<div className="govuk-form-group">
					<fieldset className="govuk-fieldset">
						<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
							<h2 className="govuk-fieldset__heading">
								Are you sure? If the proposed development requires the full EIA process, an Environmental Statement must be submitted and an additional fee of £375 will be charged.
								If you only require an EIA screening opinion, you should answer 'No' to this question
							</h2>
						</legend>
						<div className="govuk-radios govuk-radios--conditional">
							<div className="govuk-radios__item">
								<input
									className="govuk-radios__input"
									id="confirmedEiaFee"
									name="confirmedEiaFee"
									type="radio"
									value="true"
									checked={confirmedEiaFee === "true"}
									aria-describedby="confirmedEiaFee-hint"
									onChange={onChange}
								/>
								<label className="govuk-label govuk-radios__label" htmlFor="confirmedEiaFee">
									Yes
								</label>
								<div id="confirmedEiaFee-hint" className="govuk-hint govuk-radios__hint">
									The proposed development is EIA and an Environmental Statement will be submitted
								</div>
							</div>
							<div className="govuk-radios__item">
								<input
									className="govuk-radios__input"
									id="confirmedEiaFee-no"
									name="confirmedEiaFee"
									type="radio"
									value="false"
									checked={confirmedEiaFee === "false"}
									onChange={onChange}
								/>
								<label className="govuk-label govuk-radios__label" htmlFor="confirmedEiaFee-no">
									No
								</label>
							</div>
						</div>
					</fieldset>
				</div>
			</div>
		)}
		<div className="govuk-radios__item">
			<input
				className="govuk-radios__input"
				id="isEiaDevelopment-no"
				name="isEiaDevelopment"
				type="radio"
				value="false"
				checked={isEiaDevelopment === "false"}
				aria-controls="isEiaDevelopment-no-hidden"
				aria-expanded={isEiaDevelopment === "false"}
				onChange={onChange}
			/>
			<label className="govuk-label govuk-radios__label" htmlFor="isEiaDevelopment-no">
				No
			</label>
		</div>
		{isEiaDevelopment === "false" && (
			<div className="govuk-radios__conditional govuk-radios__conditional--hidden" id="isEiaDevelopment-no-hidden">
				<p className="govuk-body">
					Please note, a mandatory EIA screening will be carried out for this application due to at least one of the following reasons:
				</p>
				<ul className="govuk-list govuk-list--bullet">
					<li>The application contains an asset with a line voltage of 132kV or higher</li>
					<li>The route passes through sensitive areas that requires a screening decision</li>
				</ul>
				<p className="govuk-body">
					No further action is required.
				</p>
			</div>
		)}
	</div>
);

export default RadioGroup;
