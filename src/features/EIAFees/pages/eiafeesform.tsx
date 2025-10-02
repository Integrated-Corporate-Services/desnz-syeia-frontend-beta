
import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import RadioGroup from "../component/RadioGroup";
// Import application store/context if available
import { useApplicationStore } from "../../../store/useApplicationStore";


const EIAFeesForm: React.FC = () => {
	const navigate = useNavigate();
	const params = useParams();
	const location = useLocation();
	// Always call hooks unconditionally
	const application = useApplicationStore((state) => state.application);
	// Helper to get applicationId from store, params, or query string (mirroring ProjectOverview)
	const getApplicationId = () => {
		if (application && application.application_id) return application.application_id;
		if (params.applicationId) return params.applicationId;
		if (params.id) return params.id;
		if (typeof window !== 'undefined') {
			const searchParams = new URLSearchParams(location.search);
			const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
			if (idFromQuery) return idFromQuery;
		}
		return '';
	};
	const applicationId = getApplicationId();
	const [form, setForm] = useState({
		isEiaDevelopment: "",
		confirmedEiaFee: "",
	});
	const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setErrors([]);
		setApiError(null);
		setSuccess(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: { field: string; message: string }[] = [];
		// Validation logic:
		if (!form.isEiaDevelopment) {
			newErrors.push({ field: "isEiaDevelopment", message: "Select yes or no to the Environmental Impact Assessment question" });
		} else if (form.isEiaDevelopment === "true") {
			if (!form.confirmedEiaFee) {
				newErrors.push({ field: "confirmedEiaFee", message: "Select yes or no to confirm the EIA fee" });
			} else if (form.confirmedEiaFee === "false") {
				newErrors.push({ field: "isEiaDevelopment", message: "Select no to the Environmental Impact Assessment question" });
			}
		}
		setErrors(newErrors);
		setApiError(null);
		setSuccess(false);
		if (newErrors.length === 0) {
			setLoading(true);
			try {
				// Compose payload for backend
				const payload = {
					eiaId: crypto.randomUUID(),
					applicationId: applicationId,
					isEiaDevelopment: form.isEiaDevelopment === "true",
					requiresFullEia: form.isEiaDevelopment === "true" && form.confirmedEiaFee === "true",
					screeningOnly: form.isEiaDevelopment === "false",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					createdBy: "system",
					updatedBy: "system",
				};
				// Direct POST to backend
				const response = await fetch("http://localhost:3000/api/eia-fees", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload)
				});
				const result = await response.json();
				if (response.ok) {
					setSuccess(true);
					setForm({ isEiaDevelopment: "", confirmedEiaFee: "" });
					// Redirect to tasklist page after success
					const redirectId = payload.applicationId;
					navigate(`/task-list?id=${redirectId}`);
				} else {
					setApiError(result.message || "Failed to submit EIA Fees. Please try again.");
				}
			} catch (err) {
				setApiError("Failed to submit EIA Fees. Please try again.");
			} finally {
				setLoading(false);
			}
		}
	};

	const hasError = (field: string) => errors.some((err) => err.field === field);
	const getErrorMessage = (field: string) => {
		const err = errors.find((e) => e.field === field);
		return err ? err.message : "";
	};

	return (
		<div className="govuk-width-container">
			{success && (
				<div className="govuk-notification-banner govuk-notification-banner--success" role="alert">
					<div className="govuk-notification-banner__header">
						<h2 className="govuk-notification-banner__title">Success</h2>
					</div>
					<div className="govuk-notification-banner__content">
						EIA Fees submitted successfully.
					</div>
				</div>
			)}
			{apiError && (
				<div className="govuk-error-summary" role="alert">
					<h2 className="govuk-error-summary__title">There is a problem</h2>
					<div className="govuk-error-summary__body">{apiError}</div>
				</div>
			)}
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
								disabled={loading}
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