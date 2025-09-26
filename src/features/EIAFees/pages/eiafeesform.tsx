import React, { useState } from "react";
import RadioGroup from "../component/RadioGroup";

const EIAFeesForm: React.FC = () => {
	const [form, setForm] = useState({
		isEiaDevelopment: "",
		confirmedEiaFee: "",
	});
	const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setErrors([]);
	};


	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: { field: string; message: string }[] = [];
		// Validation: require user to select yes/no, then require 'No'
		if (!form.isEiaDevelopment) {
			newErrors.push({ field: "isEiaDevelopment", message: "Select yes or no to the Environmental Impact Assessment question" });
		} else if (form.isEiaDevelopment !== "false") {
			newErrors.push({ field: "isEiaDevelopment", message: "Select no to the Environmental Impact Assessment question" });
		}
		if (form.isEiaDevelopment === "true" && !form.confirmedEiaFee) {
			newErrors.push({ field: "confirmedEiaFee", message: "Select yes or no to confirm the EIA fee" });
		}
		setErrors(newErrors);
		if (newErrors.length === 0) {
			// Submit logic here
		}
	};

	const hasError = (field: string) => errors.some((err) => err.field === field);
	const getErrorMessage = (field: string) => {
		const err = errors.find((e) => e.field === field);
		return err ? err.message : "";
	};

	return (
		<div className="govuk-width-container">
			<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
				<ol className="govuk-breadcrumbs__list">
					<li className="govuk-breadcrumbs__list-item" aria-current="false">
						<a
							className="govuk-breadcrumbs__link"
							href="/eip/section-37/84e7bced-21f6-48d4-8aae-a06145de20f9/task-list"
						>
							Task list
						</a>
					</li>
					<li className="govuk-breadcrumbs__list-item" aria-current="true">
						EIA fees
					</li>
				</ol>
			</nav>
			{errors.length > 0 && (
				<div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary" data-govuk-error-summary-init="">
					<h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
					<div className="govuk-error-summary__body">
						<ul className="govuk-list govuk-error-summary__list">
							{errors.map((err, idx) => (
								<li key={idx}>
									<a href={`#${err.field}`}>{err.message}</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
			<main className="govuk-main-wrapper" id="main-content" role="main">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<h1 className="govuk-heading-xl">EIA fees</h1>
						<form method="post" data-module="fds-html-form" onSubmit={handleSubmit} noValidate>
							<input type="hidden" name="_csrf" value="QVa2_-t9zkYyU_MYv7Pase5wFjZdJPqXmsZ2Of1IH8CZwNlOdWeHmtoe-ncfNsMvi57u19hHO1RsEMq6rvQSW8V7LaSooewo" />
							<div className={`govuk-form-group${hasError("isEiaDevelopment") ? " govuk-form-group--error" : ""}`}>
								<fieldset className="govuk-fieldset" aria-describedby={hasError("isEiaDevelopment") ? "isEiaDevelopment-error" : undefined}>
									<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
										<h2 className="govuk-fieldset__heading">
											Do you consider that the proposed development will have a likely significant effect on the environment and therefore will be subject to an Environmental Impact Assessment?
										</h2>
									</legend>
									{hasError("isEiaDevelopment") && (
										<p id="isEiaDevelopment-error" className="govuk-error-message" style={{ color: "#d4351c" }}>
											<span className="govuk-visually-hidden">Error:</span> <span style={{ color: "#d4351c", fontWeight: "bold" }}>{getErrorMessage("isEiaDevelopment")}</span>
										</p>
									)}
								</fieldset>
								<RadioGroup
									isEiaDevelopment={form.isEiaDevelopment}
									confirmedEiaFee={form.confirmedEiaFee}
									onChange={handleChange}
								/>
							</div>
							{form.isEiaDevelopment === "true" && (
								<div className={`govuk-form-group${hasError("confirmedEiaFee") ? " govuk-form-group--error" : ""}`}>
									<fieldset className="govuk-fieldset" aria-describedby={hasError("confirmedEiaFee") ? "confirmedEiaFee-error" : undefined}>
										{hasError("confirmedEiaFee") && (
											<p id="confirmedEiaFee-error" className="govuk-error-message">
												<span className="govuk-visually-hidden">Error:</span> {getErrorMessage("confirmedEiaFee")}
											</p>
										)}
									</fieldset>
								</div>
							)}
							<button
								type="submit"
								data-module="govuk-button"
								className="govuk-button"
								value="Save and continue"
								name="Save and continue"
								data-prevent-double-click="true"
								data-fds-disable-on-submit="false"
								data-govuk-button-init=""
							>
								Save and continue
							</button>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
};

export default EIAFeesForm;
