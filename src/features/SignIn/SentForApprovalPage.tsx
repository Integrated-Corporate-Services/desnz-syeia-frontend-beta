import React from 'react';
import { useNavigate } from 'react-router-dom';


const SentForApprovalPage = () => {
	const navigate = useNavigate();
	const handleSignOut = () => {
		// TODO: Implement sign-out behaviour here (e.g., clear auth, call API, etc.)
		console.log('User signed out');
		navigate('/landingPage');
	};

return (
<div className="govuk-width-container">
<main className="govuk-main-wrapper" id="main-content" role="main">

<div className="govuk-grid-row">
<div className="govuk-grid-column-two-thirds">

{/* Required Page H1 */}
<h1 className="govuk-heading-l">Access request submitted</h1>

{/* Confirmation Panel */}
<div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6">
<h2 className="govuk-panel__title">
Your request has been submitted
</h2>
<div className="govuk-panel__body">
Reference number<br />
<strong>HDJ2123F</strong>
</div>
</div>

{/* What Happens Next */}
<div className="govuk-!-margin-bottom-6">
<h2 className="govuk-heading-m">What happens next</h2>

<p className="govuk-body">
A DNO administrator needs to approve your request before you can use this service.
</p>

<p className="govuk-body">
We will email you when your request has been reviewed. This usually takes up to 2 working days.
</p>

<div className="govuk-warning-text govuk-!-margin-top-4">
<span className="govuk-warning-text__icon" aria-hidden="true">!</span>
<strong className="govuk-warning-text__text">
<span className="govuk-warning-text__assistive">Warning</span>
You will not be able to use this service until your request is approved.
</strong>
</div>
</div>

{/* Help Section */}
<div className="govuk-!-margin-bottom-8">
<h2 className="govuk-heading-m">If you need help</h2>

<p className="govuk-body">
If you have questions about your request, contact the DNO administrator at your organisation.
</p>

<p className="govuk-body">
For technical issues using this service, email{' '}
<a href="mailto:support@desnz.gov.uk" className="govuk-link">
support@desnz.gov.uk
</a>.
</p>
</div>

{/* Sign Out */}
<p className="govuk-body">
<a
	href="#"
	className="govuk-link"
	onClick={(e) => {
		e.preventDefault();
		handleSignOut();
	}}
>
	Sign out
</a>
</p>

</div>

{/* Sidebar */}
<div className="govuk-grid-column-one-third">
<aside className="app-related-items" role="complementary">
<h2 className="govuk-heading-s" id="related-content-title">
Related content
</h2>

<nav role="navigation" aria-labelledby="related-content-title">
<ul className="govuk-list govuk-list--spaced">
<li>
</li>
<li>
<a href="#" className="govuk-link">
Contact your DNO administrator
</a>
</li>
</ul>
</nav>
</aside>
</div>

</div>
</main>
</div>
);
};

export default SentForApprovalPage;
