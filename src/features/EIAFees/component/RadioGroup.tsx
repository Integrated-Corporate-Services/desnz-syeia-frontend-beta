import React from "react";

interface RadioGroupProps {
	isEiaDevelopment: string;
	screeningOnly: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	errorMessage?: string;
	screeningErrorMessage?: string;
}


const RadioGroup: React.FC<RadioGroupProps> = ({
	isEiaDevelopment,
	screeningOnly,
	onChange,
	errorMessage,
	screeningErrorMessage,
}) => {
	return (
		<div className={`govuk-form-group${errorMessage ? ' govuk-form-group--error' : ''}`}> 
			<fieldset className="govuk-fieldset" aria-describedby={errorMessage ? "isEiaDevelopment-error" : undefined}>
				<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
					<h2 className="govuk-fieldset__heading">
						Do you consider that the proposed development will have a likely significant effect on the environment and therefore will be subject to an Environmental Impact Assessment?
					</h2>
				</legend>
				{errorMessage && (
					<p id="isEiaDevelopment-error" className="govuk-error-message" style={{ color: "#d4351c" }}>
						<span className="govuk-visually-hidden">Error:</span> {errorMessage}
					</p>
				)}
				<div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
					<div className="govuk-radios__item">
						<input
							className="govuk-radios__input"
							id="isEiaDevelopment"
							name="isEiaDevelopment"
							type="radio"
							value="true"
							checked={isEiaDevelopment === "true"}

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
									{screeningErrorMessage && (
										<p id="screeningOnly-error" className="govuk-error-message" style={{ color: "#d4351c" }}>
											<span className="govuk-visually-hidden">Error:</span> {screeningErrorMessage}
										</p>
									)}
									<div className="govuk-radios govuk-radios--conditional">
										<div className="govuk-radios__item">
											<input
												className="govuk-radios__input"
												id="screeningOnly"
												name="screeningOnly"
												type="radio"
												value="true"
												checked={screeningOnly === "true"}
												aria-describedby="screeningOnly-hint"
												onChange={onChange}
											/>
											<label className="govuk-label govuk-radios__label" htmlFor="screeningOnly">
												Yes
											</label>
											<div id="screeningOnly-hint" className="govuk-hint govuk-radios__hint">
												The proposed development is EIA and an Environmental Statement will be submitted
											</div>
										</div>
										<div className="govuk-radios__item">
											<input
												className="govuk-radios__input"
												id="screeningOnly-no"
												name="screeningOnly"
												type="radio"
												value="false"
												checked={screeningOnly === "false"}
												onChange={onChange}
											/>
											<label className="govuk-label govuk-radios__label" htmlFor="screeningOnly-no">
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

							onChange={onChange}
						/>
						<label className="govuk-label govuk-radios__label" htmlFor="isEiaDevelopment-no">
							No
						</label>
					</div>
					{isEiaDevelopment === "false" && (
						<div className="govuk-radios__conditional" id="isEiaDevelopment-no-hidden">
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
			</fieldset>
		</div>
	);
};

export default RadioGroup;
